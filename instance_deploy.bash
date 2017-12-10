STAGING_DIR=~/website_staging

sudo rm -rf temp-stage
sudo mkdir temp-stage
sudo cp -R $STAGING_DIR/* temp-stage
sudo chown -R root:root temp-stage
sudo cp -R temp-stage/* /
sudo rm -rf temp-stage
