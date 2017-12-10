WEBSITE_DIR=~/Documents/thinkingalaudwebsite/
SSH_KEY=~/.ssh/google_compute_engine
USER=andyl
INSTANCE_IP=35.227.35.14
INSTANCE_NAME=instance-1

cd $WEBSITE_DIR
rsync -vaz -e "ssh -i $SSH_KEY" --exclude-from=.rsync-exclude --delete $WEBSITE_DIR/root/ $USER@$INSTANCE_IP:~/website_staging/
rsync -vaz -e "ssh -i $SSH_KEY" --exclude-from=.rsync-exclude --delete $WEBSITE_DIR/instance_deploy.bash $USER@$INSTANCE_IP:~
gcloud compute ssh $INSTANCE_NAME --command="bash instance_deploy.bash"

