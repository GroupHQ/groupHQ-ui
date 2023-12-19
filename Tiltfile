# By default, build image locally unless env variable is set to false
build_locally = os.getenv('TILT_BUILD_GROUPHQ_UI_LOCALLY', 'true').lower() == 'true'

# Build
if build_locally:
    custom_build(
        # Name of the container image
        ref = 'ghcr.io/grouphq/grouphq-ui',
        # Command to build the container image
        command = 'packAppTilt.sh',
        # Files to watch that trigger a new build
        deps = ['angular.json', 'src']
    )

# Deploy
k8s_yaml(kustomize('k8s'))

# Manage
k8s_resource('grouphq-ui', port_forwards=['4200'])