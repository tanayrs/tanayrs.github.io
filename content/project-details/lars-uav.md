# LARS-UAV: Low-Altitude Remote Sensing using Unmanned Aerial Vehicles for Crop Health Monitoring

## Introduction

Agriculture is the backbone of India, with 50% of the nation depending on it for their livelihood.<sup>[1]</sup>

India produces 25% of the world's crop, however as per the Food and Agriculture Organization, 40% of the global crop production is lost every year due to pests and diseases.<sup>[2]</sup>

**Current Solution:** Manual inspection by trained professionals, however the progress is slow.

**Problem Statement:** How can we remotely and autonomously monitor crop health, yield, diseases, and pests at various growth stages?

**What Makes us Different:**

- Autonomous crop monitoring framework powered by low-altitude multispectral UAV imaging and on-device inference.
- Detection of stress zones, early disease symptoms, crop health, and deployment of ground robots for detailed inspection.

## Motivation

<p align="center">
  <img src="https://github.com/user-attachments/assets/f4088461-42d8-403c-a822-22eaa5f85e35" alt="NDVI maps"/>
</p>

_NDVI maps calculated for rice plot 6 (Quinta do Canal) using data from Sentinel-2A (left) and UAS (right) imagery the spatial resolution of, respectively, 10 m and 0.074 m. The data were obtained during the rice reproductive phase, respectively, on the 8th and 9th of July, 2020._

_Advantages of drone-based imaging to satellites:_

- Satellite data has much lower resolution than UAS drones.
- UAS allows data collection at flexible timings.

**Limitations:** Imaging resolution is too low to monitor each plant.

## How to monitor crop health?

### Our Paper Title

Advancing Real-Time Crop Disease Detection on Edge Computing Devices using Lightweight Convolutional Neural Networks

### Gap

Early rice disease detection is crucial for food security, but deploying deep learning models in resource-constrained environments is challenging.

### Our Approach

Early detection of rice diseases is vital for food security, but conventional deep learning models are too resource-intensive for real-time use on edge devices. We developed a lightweight convolutional neural network based on MobileNet-V4, trained on a dataset of 16,225 images covering 13 rice diseases. The model was optimized and converted to TensorFlow Lite (TFLite) format for efficient deployment on resource-constrained hardware like Raspberry Pi 5, Nvidia P100 GPUs, and CPUs. This enables fast, accurate disease detection directly on drones or field devices, bridging the gap between high-accuracy models and real-time field deployment, offering a practical solution for early rice disease detection in resource-limited environments.

### Our Results

<p align="center">
  <img src="https://github.com/user-attachments/assets/a0ff0660-9a50-4355-a834-1d360baf7d46" alt="results"/>
</p>

While comparing baseline models, without any optimization, ResNet-34 performs marginally better than MobileNet-V4, and has significant gains over MobileNet-V2 and MobileNet-V3 as seen in Table 3.

As seen in Table 4, MobileNet-V4 achieves a test accuracy of 97.84 % when optimized, demonstrating the eﬃcacy of these techniques in improving generalization over its baseline configuration and ResNet-34. Despite this high accuracy, the confusion matrix in Fig.3 reveals systematic misclassifications in visually similar disease categories, such as bacterial leaf blight vs. bacterial leaf streak and white stem borer vs. yellow stem borer. Additionally, minority classes, like bacterial panicle blight, exhibit slightly lower recall, suggesting the eﬀect of class imbalance. The model also misclassifies mild cases of brown spot and downy mildew as Normal, indicating potential overlap in visual features. This can be addressed by enhancing fine-grained disease diﬀerentiation through attention-based feature extraction.

As shown in Table 5, TFLite lacks CUDA GPU optimizations for MobileNet-V4 and ResNet34, resulting in inference times that remain largely unchanged. In contrast, MobileNet-V2 experiences a significant performance boost. The observations made from Table 5 are as follows.

- MobileNet Models: Consistently demonstrated faster inference times across all platforms, particularly on the Raspberry Pi 5, due to their lightweight design.
- MobileNet-V4: Achieved the highest accuracy and the lowest inference times.
- TFLite Eﬃciency: TFLite models generally outperformed PyTorch models in inference speed, highlighting the advantages of the format for edge deployment.

The experiments reveal critical trade-oﬀs between accuracy and speed. MobileNet-V4 emerged as a strong candidate for edge deployment, balancing speed and accuracy eﬀectively. It is also suited for scenarios, where computational resources are less constrained as it can provide even faster inference times. TFLite's performance gains emphasize on the importance of model optimization for resource-limited platforms like the Raspberry Pi 5.

The power eﬃciency analysis revealed that MobileNet-V4 demonstrated superior energy eﬃciency compared to other tested models, which can be seen in Table 6. MobileNet-V2 consumed approximately 30% less energy per inference than MobileNet-V4 and 90% less than ResNet34. However, this improved energy eﬃciency came at the cost of accuracy, as shown in Table 3. MobileNet-V4 presented a more balanced option, using significantly less energy than ResNet34 (66% reduction in energy per inference) while having a higher accuracy and F1-Score as mentioned in Table 3. When combined with the faster inference times reported in Table 5, MobileNet-V4 emerged as the optimal model for deployment in resource-constrained agricultural environments, where battery life and thermal management were critical considerations. The power eﬃciency analysis revealed that MobileNet-V4 demonstrated superior energy eﬃciency compared to other tested models, which can be seen in Table 6.

### Paper Citation

Nanda, T.R., Shukla, A., Srinivasa, T.R., Bhargava, J., Chauhan, S. (2025). Advancing Real-Time Crop Disease Detection on Edge Computing Devices Using Lightweight Convolutional Neural Networks. In: Arai, K. (eds) Intelligent Systems and Applications. IntelliSys 2025. Lecture Notes in Networks and Systems, vol 1567. Springer, Cham. [https://doi.org/10.1007/978-3-032-00071-233](https://doi.org/10.1007/978-3-032-00071-233)

## What about the groundbot?

<p align="center">
  <img src="https://github.com/user-attachments/assets/ff40d9b7-80ba-491a-8e08-96dc5befac27" alt="Deployment Flowchart"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/c54e2d43-6401-447c-b71d-3fb3c8fe16d5" alt="ROS Environment"/>
</p>

Figures show the deployment flowchart and ROS Environment overview.

## GitHub

[https://github.com/lars-uav](https://github.com/lars-uav)

## Citations

1. Food and Agriculture Organization of the United Nations, "India at a glance," FAO in India. [Online]. Available: [FAO India at a glance](https://www.fao.org/india/fao-in-india/india-at-a-glance/en/)
2. Food and Agriculture Organization of the United Nations, "About Plant Production and Protection," FAO. [Online]. Available: [FAO Plant Production and Protection](https://www.fao.org/plant-production-protection/about/en#:~:text=Every%20year%2C%20up%20to%2040,at%20least%20USD%2070%20billion)
