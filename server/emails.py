import os

import requests


MAILGUN_DOMAIN = os.environ['MAILGUN_DOMAIN']
MAILGUN_API_KEY = os.environ['MAILGUN_API_KEY']
SERVER_URL = os.environ['REACT_APP_SERVER_URL']


def _send_email(to, subject, html):
    return requests.post(
        f'https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages',
        auth=('api', MAILGUN_API_KEY),
        data={
            'subject': subject,
            'to': [to],
            'from': 'HMS Advise Admin <razzi@abuissa.net>',
            'html': html
        },
    )


EMAIL_CLOSING = """
<p>
    Regards,
</p>

<p>
    HMS Advise Team
</p>
"""


def get_verification_url(token):
    return f'{SERVER_URL}/verify?token={token}'


def send_confirmation_token(email, token, login=False):
    verify_url = get_verification_url(token)

    verb = (
        'verify your email'
        if not login
        else 'login'
    )

    html = f"""
    <p>Hi,</p>

    <p>
        Follow this link to {verb}: <a href="{verify_url}">{verify_url}</a>.
    </p>

    {EMAIL_CLOSING}
    """

    return _send_email(email, 'HMS Advise verification token', html)


def send_login_email(email, name, token):
    greeting = (
        'Hi,'
        if not name
        else name
    )

    verify_url = get_verification_url(token)

    html = f"""
    <p>
        {greeting}
    </p>

    <p>
        Please follow this link to log in to HMS advising: <a href="{verify_url}">{verify_url}</a>
    </p>

    {EMAIL_CLOSING}
    """

    return _send_email(
        to=email,
        subject='Log in to HMS Advising',
        html=html
    )
