# Builds NGINX container image using Paketo Buildpacks for Angular app
# The image is installed to your local Docker registry

npm run build

pack build "$EXPECTED_REF" \
  --buildpack gcr.io/paketo-buildpacks/nginx \
  --builder paketobuildpacks/builder:base \
  -p dist