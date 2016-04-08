# Steps #

  1. Make sure django is installed and working properly
  1. Checkout django-webmail
  1. Edit settings.py to suit your configuration
  1. Run manage.py syncdb
  1. Run manage.py runserver
  1. Access the admin site via your browser
  1. Create a new django user
  1. Make sure to go in and edit the user's settings and set the imap server to None
  1. Go to http://yourserver:port/mail/ and login as the user. You should go automatically to a new server setup screen where you enter your imap settings