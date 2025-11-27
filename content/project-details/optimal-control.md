# Optimal Control using Physics Inspired Machine Learning for Aerospace Applications

## Background

One of ISRO's research goals is to optimally lower spacecrafts on the moon and mars. Scheduling thrust vs time, to minimize fuel used, is an 'optimal control problem' (OCP). For Aerospace applications, the minimum fuel landing and the minimum time space attitude maneuver is essential. Existing ways to solve OCPs either simplify the problem for analytical solutions or apply convex optimization which is fully iterative in nature. In this work we are interested in combining the best of both approaches by using using data obtained from high fidelity simulations.

In particular, we are interested in solving the Hamilton-Bellman-Jacobi (HJB) Partial Differential Equation (PDE), a neccessary and sufficient condition for optimality. The solution to this equation is a value function from which closed loop optimal control laws can be derived. Traditional methods to solve partial differential equations are faced with the curse of dimensionality, which makes them infeasible for high dimensional problems. Hence, we propose the use of Physics Informed Neural Networks (PINNs) to learn the value function.

## What makes our approach unique?

- **Ability to solve high dimensional problems**
  - The use of PINNs allows us in theory to overcome the curse of dimensionality.

- **Use the Extreme Theory of Functional Connections (X-TFC)**
  - The theory of functional connections provides a framework to analytically satisfy the constraints of the PDE, simplifying the training process to a single-objective optimization from a multiple-objective optimization.
  - The X-TFC network uses a single hidden layer fully connected network, which allows the use of the Extreme Learning Machine (ELM) algorithm. This acts as a pre-training step, which helps with the sensitivity of PINNs to initialization for non-linear PDEs.

- **Constrained Controllers**
  - Current Literature does not extensively discuss the synthesis of controllers for a constrained action space. We are actively investigating the use of PINNs to learn the value function for a constrained action space.

## Publication

[https://doi.org/10.48550/arXiv.2510.27187](https://doi.org/10.48550/arXiv.2510.27187)

## Poster

[Link to Poster](optimal-control.pdf)
