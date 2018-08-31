STAGING_DIR=~/website_staging

# sudo apt-get install python-virtualenv | yes
# TODO: check if thinkingalaud virtualenv installed
# . thinkingalaud/bin/activate
# pip install Flask
# pip install pytz

sudo rm -rf temp-stage
sudo mkdir temp-stage
sudo cp -R $STAGING_DIR/* temp-stage
sudo chown -R root:root temp-stage
sudo cp -R temp-stage/* /
sudo rm -rf temp-stage
