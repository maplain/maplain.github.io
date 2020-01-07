package data

const ()

func init() {
	docker := Node{
		Name:    "Docker",
		Company: "Docker",
		Link:    "Fangyuan#Docker",
		Type:    basedOn,
	}
	k8s := Node{
		Name:    "Kubernetes",
		Company: "Google",
		Link:    "Fangyuan#Kubernetes",
	}
	ignite := Node{
		Name:    "Ignite",
		Company: "Weave",
		Link:    "Fangyuan#ignite",
	}
	kataContainer := Node{
		Name:    "Kata-Container",
		Company: "Intel",
		Link:    "Fangyuan#Kata_Container",
	}
	acrn := Node{
		Name:    "ACRN",
		Company: "Intel",
	}
	cloudHypervisor := Node{
		Name:    "Cloud-Hypervisor",
		Company: "Intel",
	}
	fireCracker := Node{
		Name:    "Firecracker",
		Company: "Amazon",
	}
	rustVMM := Node{
		Name:    "Rust-VMM",
		Company: "Amazon",
	}
	kvm := Node{
		Name:    "KVM",
		Company: "Linux",
	}
	qemu := Node{
		Name:    "QEMU",
		Company: "Open Source",
	}
	esxi := Node{
		Name:    "ESXi",
		Company: "VMware",
	}
	lxc := Node{
		Name:    "LXC",
		Company: "Linux",
	}
	xen := Node{
		Name:    "XEN",
		Company: "Unknown",
	}
	etc := Node{
		Name:    "...",
		Company: "",
	}
	libvirt := Node{
		Name:    "libvirt",
		Company: "redhat",
	}
	virtlet := Node{
		Name:    "Virtlet",
		Company: "Mirantis",
	}
	kubevirt := Node{
		Name:    "Kubevirt",
		Company: "Redhat",
	}
	cloudNativeVirtualization := Data{
		Nodes: []Node{
			docker,
			k8s,
			ignite,
			kataContainer,
			acrn,
			cloudHypervisor,
			fireCracker,
			rustVMM,
			kvm,
			qemu,
			libvirt,
			esxi,
			lxc,
			xen,
			etc,
			virtlet,
			kubevirt,
		},
	}
	cloudNativeVirtualization.AddLink(docker.Name, kataContainer.Name)
	cloudNativeVirtualization.AddLink(k8s.Name, kataContainer.Name)
	cloudNativeVirtualization.AddLink(kataContainer.Name, acrn.Name)
	cloudNativeVirtualization.AddLink(kataContainer.Name, cloudHypervisor.Name)
	cloudNativeVirtualization.AddLink(kataContainer.Name, fireCracker.Name)
	cloudNativeVirtualization.AddLink(kataContainer.Name, qemu.Name)
	cloudNativeVirtualization.AddLink(cloudHypervisor.Name, rustVMM.Name)
	cloudNativeVirtualization.AddLink(fireCracker.Name, rustVMM.Name)
	cloudNativeVirtualization.AddLink(rustVMM.Name, kvm.Name)
	cloudNativeVirtualization.AddLink(qemu.Name, kvm.Name)
	cloudNativeVirtualization.AddLink(ignite.Name, fireCracker.Name)
	cloudNativeVirtualization.AddLink(libvirt.Name, qemu.Name)
	cloudNativeVirtualization.AddLink(libvirt.Name, esxi.Name)
	cloudNativeVirtualization.AddLink(libvirt.Name, lxc.Name)
	cloudNativeVirtualization.AddLink(libvirt.Name, xen.Name)
	cloudNativeVirtualization.AddLink(libvirt.Name, etc.Name)
	cloudNativeVirtualization.AddLink(virtlet.Name, libvirt.Name)
	cloudNativeVirtualization.AddLink(kubevirt.Name, libvirt.Name)
	AllData = append(AllData, cloudNativeVirtualization)
}
