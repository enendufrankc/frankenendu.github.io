from flask import Flask, request, redirect, url_for, flash
from flask_mail import Mail, Message
import os

app = Flask(__name__)

# Load environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Configure Flask-Mail using environment variables
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))  # Default to 587 if not set
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)


@app.route('/submit', methods=['POST'])
def submit_form():
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    message = request.form.get('message')
    
    msg = Message("Form Submission",
                  recipients=['your_recipient_email@example.com'])
    msg.body = f"Name: {name}\nEmail: {email}\nPhone: {phone}\nMessage: {message}"
    mail.send(msg)
    
    flash('Form submitted successfully!')
    return redirect(url_for('index'))

@app.route('/')
def index():
    return 'Hello, World! This is the index page.'

if __name__ == '__main__':
    app.run(debug=True)
