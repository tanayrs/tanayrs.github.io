# Neural Networks for Optimal Control: A Physics-Informed Approach

## Background

A range of aerospace problems share the same skeleton: pick a control history that minimises a cost subject to dynamics. Lowering a spacecraft onto Mars while burning the least fuel, slewing a satellite to point at a target as quickly as possible, and steering an interceptor — all of these are *optimal control problems* (OCPs).

The classical recipes split into two camps. **Trajectory optimisation** discretises the trajectory and hands the resulting nonlinear program to a solver like IPOPT or `fmincon`. It works, but it returns a single trajectory for a single initial condition; perturb the start state and you re-solve from scratch. **Dynamic programming** instead seeks the *value function* `V(x, t)` — the optimal cost-to-go from any state at any time — by solving the Hamilton–Jacobi–Bellman (HJB) partial differential equation. From `V` an analytical feedback law falls out, valid everywhere. The catch is the curse of dimensionality: a grid solver scales as `N^d`, and `d = 7` for spacecraft attitude control already puts a coarse `N = 20` grid past a billion cells.

This project asks whether **physics-informed neural networks (PINNs)** can solve the HJB equation directly in high dimensions, giving us the global, real-time feedback policy that classical PDE solvers cannot.

## The HJB Equation

Bellman's principle of optimality says that any tail of an optimal trajectory is itself optimal. Applied over an infinitesimal step and Taylor-expanded, this collapses to the HJB equation:

`-∂V/∂t (x, t) = min_u [ L(x, u, t) + (∂V/∂x)(x, t) · f(x, u, t) ]`

with a terminal boundary condition `V(x, t_f) = φ(x)`. For an LQR-style running cost `ℓ = xᵀQx + uᵀRu`, the inner minimisation has a closed form, and the optimal feedback policy is recovered as

`u*(x, t) = -½ R⁻¹ (∂f/∂u)ᵀ (∂V/∂x)ᵀ`

Solve for `V` once and you have a controller for every state.

## Why PINNs

Instead of discretising the state space, we approximate `V` with a neural network `𝒩_θ(x, t)` and train it so that the HJB residual is zero on a set of *collocation points* sampled across the state–time domain. Autograd gives us `∂𝒩/∂x` and `∂𝒩/∂t` exactly, so the residual is a smooth function of the network parameters — no labels are needed; the PDE itself is the supervision signal. The universal approximation theorem says this is in principle possible; the engineering question is whether it actually trains.

Three design choices make the difference between a network that converges and one that does not:

- **Theory of Functional Connections (TFC).** A naive penalty for the boundary condition `V(x, t_f) = φ(x)` competes with the HJB residual during training and frequently loses. TFC sidesteps this by constructing the approximation as `V̂(x, t) = 𝒩_θ(x, t) − 𝒩_θ(x, t_f) + φ(x)`. The boundary holds *identically* for every weight setting, so the optimiser is left with a single objective: drive the HJB residual to zero.
- **Smooth activations.** The HJB residual contains derivatives of the network, so ReLU's piecewise-constant gradient is fatal. We use **SiLU (Swish)**: smooth, self-gated, empirically the best of the smooth activations on this class of problem.
- **Wide, shallow networks.** Each extra hidden layer multiplies another sub-unit derivative into the chain rule; deep PINNs vanish their PDE-residual gradient before training can fit it. A single hidden layer of 64–128 SiLU neurons, leaning on universal approximation, consistently beats deeper architectures here.

## Four Problem Settings

The framework was developed against a ladder of OCP formulations, each one closer to the realistic spacecraft setting:

1. **Infinite-horizon stationary HJB** — the simplest case, with no terminal time at all.
2. **Fixed final time, soft terminal penalty.**
3. **Free final time, soft terminal penalty** — `t_f` is itself an optimisation variable. Switching to a "time-to-go" coordinate `τ = t_f − t` moves the boundary from an unknown moving point onto the fixed wall `τ = 0`, restoring TFC's applicability. A *transversality* condition — the Hamiltonian must vanish at the optimal stop time — becomes an extra residual term in the loss.
4. **Free final time, hard terminal constraint** — the boundary is now `V(x, 0) = 0` if `x = x_f` and `+∞` otherwise. Networks cannot represent infinity or step discontinuities, so we apply the **Kružkov transformation** `η = 1 − exp(−V)`, which compresses `V ∈ [0, ∞)` onto `η ∈ [0, 1)` and turns the impossible boundary into a clean `η(x_f, 0) = 0`, `η(x ≠ x_f, 0) = 1`.

## Case Study: Spacecraft Attitude Control

The flagship test is a full nonlinear rigid-body slew with quaternion kinematics and Euler dynamics:

`q̇ = ½ Ω(ω) q,    J ω̇ + ω × (J ω) = u,    ‖u‖_∞ ≤ u_max`

The state is seven-dimensional — well past where grid-based HJB solvers are usable. The cost is time–energy:

`ℓ(x, u) = α + qᵀ Q_q q + ωᵀ Q_ω ω + uᵀ R_u u`

with `α` setting the time-vs-effort trade-off and the quadratic terms penalising attitude error, body rate, and control effort.

### Results

- **Free-final-time, soft terminal penalty.** A `140°` eigen-axis rest-to-rest slew. The PINN converged to `t_f* = 115 s`; a Radau-collocation trajectory optimiser with a hard terminal constraint produced `t_f* = 113.5 s`. **Within 1.4%** of the off-line benchmark, with a per-state policy evaluation in roughly `1 ms` instead of the seconds-to-tens-of-seconds the trajopt solver takes. Transversality `H → 0` was verified along the simulated trajectory.

<p align="center">
  <img src="exp1_plt.png" alt="Free-final-time soft terminal: state, control, and value-function traces for a 140° rest-to-rest slew" />
</p>

- **Monte Carlo over 1000 random initial conditions** drawn from the full attitude sphere: **>99% converged** for both rest-to-rest and rate-to-rate manoeuvres, with optimal times spread over `60–140 s` and `~1 ms` per evaluation throughout.

<p align="center">
  <img src="exp2_mc.png" alt="Monte Carlo, rest-to-rest manoeuvres over 1000 random initial conditions" />
  <br/>
  <em>Rest-to-rest Monte Carlo (1000 ICs).</em>
</p>

<p align="center">
  <img src="exp3_mc.png" alt="Monte Carlo, rate-to-rate manoeuvres over 1000 random initial conditions" />
  <br/>
  <em>Rate-to-rate Monte Carlo (1000 ICs).</em>
</p>

- **Stationary HJB with the Kružkov transformation** — the hardest of the four settings, with the hard terminal constraint baked in. Across 100 random initial conditions on the full attitude sphere with body rates up to `±0.05 rad/s`, **100 of 100 converged** to within `‖e_q‖ < 0.02`, mean `‖e_q‖ = 1.43 × 10⁻²`. The trained controller exhibits a clean bang-then-glide structure: torque saturates within the first ~50 s and decays smoothly thereafter. The origin boundary condition `η(0) = 0` holds *by construction* through TFC, with no penalty weight to tune.

<p align="center">
  <img src="kruzkov_mc.png" alt="Stationary Kruzkov Monte Carlo: 100 of 100 ICs converged within ‖e_q‖ < 0.02" />
  <br/>
  <em>Stationary Kružkov Monte Carlo (100 ICs).</em>
</p>

The single trained network is a globally stabilising feedback controller — one offline solve, real-time deployment, no per-trajectory re-optimisation.

## What's Hard About This

- **Training is not guaranteed to converge.** The HJB loss landscape is non-convex; weight initialisations, sample distributions, and even saturation conventions in the residual visibly change which basin the optimiser settles in. Pretraining on either a simple quadratic warm-start or on offline trajectory-optimisation samples is sometimes necessary to break symmetry and pick the stabilising branch.
- **Cost-weight sensitivity.** Closed-loop performance is unexpectedly sensitive to the entries of `Q` and `R`; we have run sweeps over `(Q, R, α)` to map the time-vs-effort Pareto front, but there is no a-priori recipe.
- **Steady-state error.** The value function's gradient asymptotes too softly near the origin to drive the residual error all the way down. PINN solutions track a hard-terminal trajectory optimiser closely on shape and timing, but with a small residual offset that the smooth value function cannot iron out.
- **Constrained controllers.** Hard input bounds `‖u‖_∞ ≤ u_max` are handled at deployment via clipping, but baking the constraint into the HJB residual itself remains an open direction — empirically, putting `tanh` saturation inside the residual makes the closed-loop policy worse, not better.

## Publication

[https://doi.org/10.48550/arXiv.2510.27187](https://doi.org/10.48550/arXiv.2510.27187)

## Poster

[Link to Poster](optimal-control.pdf)
