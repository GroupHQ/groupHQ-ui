# Builds NGINX container image using Paketo Buildpacks for Angular app
# The image is installed to your local Docker registry

npm run build

pack build "grouphq-ui" \
  --buildpack gcr.io/paketo-buildpacks/nginx \
  --builder paketobuildpacks/builder:base \
  -p dist