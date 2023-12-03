# Build
custom_build(
    # Name of the container image
    ref = 'grouphq-ui',
    # Command to build the container image
    command = 'packApp.sh',
    # Files to watch that trigger a new build
    deps = ['angular.json', 'src']
)

# Deploy
k8s_yaml(kustomize('k8s'))

# Manage
k8s_resource('grouphq-ui', port_forwards=['4200'])