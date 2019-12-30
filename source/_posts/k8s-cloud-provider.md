---
title: Notes on Kubernetss Cloud Provider
date: 2019-08-01 09:42:20
tags:
---


## Terminology

cloudprovider.Interface: [https://github.com/kubernetes/cloud-provider/blob/master/cloud.go#L43](https://github.com/kubernetes/cloud-provider/blob/master/cloud.go#L43)

type loadbalancer interface: [https://github.com/kubernetes/cloud-provider/blob/master/cloud.go#L106](https://github.com/kubernetes/cloud-provider/blob/master/cloud.go#L106)

1.  GetLoadbalancer
2.  GetLoadBalancerName
3.  EnsureLoadBalancer
4.  UpdateLoadBalancer  
5.  EnsureLoadBalancerDeleted
    

## Components

### Cloud controller manager
k8s.io/kubernetes/cmd/cloud-controller-manager
one package: app, which contains the core logic of cloud-controller-manager.
Starts:
1.  [Node controller](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cloud/node_controller.go#L61)
2.  [Node lifecycle controller](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cloud/node_lifecycle_controller.go#L67)    
3.  [Service controller](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller/service)    
4.  [Route controller](https://github.com/kubernetes/kubernetes/tree/master/pkg/controller/route)    

Ref: [here](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/app/controllermanager.go#L169)

### Service Controller
Service controller will be managing LoadBalancer type of service, see [here](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/service/service_controller.go#L238) for the initialization.

1.  Run() starts a group of workers [here](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/service/service_controller.go#L205)
2.  Worker() calls processNextWorkItem();
3.  processNextWorkItem() calls syncService();
4.  syncService() by default calls processServiceCreateOrUpdate();
5.  processServiceCreateOrUpdate() calls syncLoadBalancerIfNeeded() if needed;
6.  syncLoadBalancerIfNeeded() calls ensureLoadBalancer() if loadbalancer needs to be created;
7.  Calls cloud provider’s [EnsureLoadBalancer](https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/service/service_controller.go#L374) through cloudprovider.Interface with a group of nodes;
    

## Examples

### vSphere out-of-tree Cloud Provider
1.  Vsphere-cloud-controller-manager is a cobra command which invokes [app.Run](https://github.com/kubernetes/cloud-provider-vsphere/blob/master/cmd/vsphere-cloud-controller-manager/main.go#L99);
2.  [Run](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/app/controllermanager.go#L115) starts above mentioned [four controllers](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/app/controllermanager.go#L169) and [here](https://github.com/kubernetes/kubernetes/blob/master/cmd/cloud-controller-manager/app/controllermanager.go#L276);
    
As a result, vsphere-cloud-provider-manager is a concrete “implementation” of cloud-controller-manager upstream in the sense that:
1.  Leverages the same app package to Run;
2.  Implements cloudprovider.Interface;
    
### Azure out-of-tree Cloud provider
1.  Azure cloud provider does the same thing [here](https://github.com/kubernetes/cloud-provider-azure/blob/v0.2.0/cloud-controller-manager/main.go#L84);

### Aws out-of-tree Cloud Provider
1.  Aws cloud provider does the same thing [here](https://github.com/kubernetes/cloud-provider-aws/blob/master/cmd/aws-cloud-controller-manager/main.go#L76);
    
### Openstack out-of-tree Cloud Provider
1.  Openstack cloud provider does the same thing [here](https://github.com/kubernetes/cloud-provider-openstack/blob/master/cmd/openstack-cloud-controller-manager/main.go#L103);
    
### AliCloud Cloud Provider
AliCloud Cloud Provider is an exception, seems like it “copies” upstream cloud-controller-manager and other controllers’ code, and made its own modifications.

1.  Run [calls](https://github.com/kubernetes/cloud-provider-alibaba-cloud/blob/master/cmd/cloudprovider/app/ccm.go#L214)  [MainLoop](https://github.com/kubernetes/cloud-provider-alibaba-cloud/blob/master/cmd/cloudprovider/app/ccm.go#L228);
2.  MainLoop calls [RunControllers](https://github.com/kubernetes/cloud-provider-alibaba-cloud/blob/master/cmd/cloudprovider/app/ccm.go#L210);
3.  RunControllers calls [runControllerPV](https://github.com/kubernetes/cloud-provider-alibaba-cloud/blob/master/cmd/cloudprovider/app/ccm.go#L284) and [runControllerService](https://github.com/kubernetes/cloud-provider-alibaba-cloud/blob/master/cmd/cloudprovider/app/ccm.go#L289), which in turn starts its own controllers;
    
### Summary
To summarize, to implement an out-of-tree cloud provider:
1.  the entry point is app.Run;
2.  Have your own implementation of cloudprovider.Interface;
3.  Register your own cluster provider by calling cloudprovider.RegisterCloudProvider, because cloud-controller-manager calls [InitCloudProvider](https://github.com/kubernetes/kubernetes/blob/v1.16.0-alpha.2/cmd/cloud-controller-manager/app/controllermanager.go#L119) to initialize cloud provider instance;
    
1.  InitCloudProvider uses configured name to get corresponding registered initialization function in an internal map, which can be updated by RegisterCloudProvider;
2.  See example [here](https://github.com/kubernetes/cloud-provider-vsphere/blob/v0.2.1/pkg/cloudprovider/vsphere/cloud.go#L41-L49) in vsphere cloud provider;
    
Here is an example I created: [https://github.com/maplain/dummy-k8s-cloud-provider](https://github.com/maplain/dummy-k8s-cloud-provider)

## References
Cloud Controller Manager: [https://kubernetes.io/docs/concepts/architecture/cloud-controller/](https://kubernetes.io/docs/concepts/architecture/cloud-controller/)
Develop an out-of-tree Cloud Provider: [https://kubernetes.io/docs/tasks/administer-cluster/developing-cloud-controller-manager/#out-of-tree](https://kubernetes.io/docs/tasks/administer-cluster/developing-cloud-controller-manager/#out-of-tree)
KEP: [https://github.com/kubernetes/enhancements/blob/master/keps/sig-cloud-provider/0002-cloud-controller-manager.md#remove-cloud-provider-code-from-kubernetes-core](https://github.com/kubernetes/enhancements/blob/master/keps/sig-cloud-provider/0002-cloud-controller-manager.md#remove-cloud-provider-code-from-kubernetes-core)

### Out-of-tree cloud providers
Vsphere: [https://github.com/kubernetes/cloud-provider-vsphere](https://github.com/kubernetes/cloud-provider-vsphere)
Alibaba: [https://github.com/kubernetes/cloud-provider-alibaba-cloud](https://github.com/kubernetes/cloud-provider-alibaba-cloud)
Azure: [https://github.com/kubernetes/cloud-provider-azure](https://github.com/kubernetes/cloud-provider-azure)
Openstack: [https://github.com/kubernetes/cloud-provider-openstack](https://github.com/kubernetes/cloud-provider-openstack)
Aws: [https://github.com/kubernetes/cloud-provider-aws](https://github.com/kubernetes/cloud-provider-aws)

### Common Packages
[Klog](https://github.com/kubernetes/klog) for logging
[Gcfg](https://godoc.org/gopkg.in/gcfg.v1) for config file, which has the same syntax as [git](https://git-scm.com/docs/git-config#_syntax)
