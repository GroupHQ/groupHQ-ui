# Builds NGINX container image using Paketo Buildpacks for Angular app
# The image is installed to your local Docker registry

# This script is used by the Tiltfile in the current directory to deploy to a local minikube Kubernetes cluster
# The $EXPECTED_REF is set to a random name chosen by Tilt.
# To build an image with grouphq-ui as the name, run packApp.sh instead

npm run build

pack build "$EXPECTED_REF" \
  --buildpack gcr.io/paketo-buildpacks/nginx \
  --builder paketobuildpacks/builder:base \
  -p dist