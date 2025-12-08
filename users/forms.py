
from django import forms
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'autocomplete': 'email'}),
        error_messages={
            'required': 'Email is required.',
            'invalid': 'Enter a valid email address.',
        }
    )
    password1 = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"})
    )
    password2 = forms.CharField(
        label="Confirm Password",
        widget=forms.PasswordInput(attrs={"autocomplete": "new-password"})
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")
        
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Email is already registered.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get("username")
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2:
            # Passwords do not match
            if password1 != password2:
                self.add_error("password1", "Passwords do not match.")
                self.add_error("password2", "Passwords do not match.")

            # Password same as username
            if username and password1.lower() == username.lower():
                self.add_error("password1", "Password cannot be the same as your username.")
                self.add_error("password2", "Password cannot be the same as your username.")

            # Django password validation
            try:
                validate_password(password2, self.instance)
            except forms.ValidationError as e:
                for msg in e.messages:
                    self.add_error("password1", msg)
                    self.add_error("password2", msg)

        return cleaned_data
    
    
class CustomPasswordResetForm(PasswordResetForm):
    def clean_email(self):
        email = self.cleaned_data.get('email')

        # Check if the email exists in the database
        if not User.objects.filter(email=email).exists():
            raise forms.ValidationError("No account found with this email address.")

        return email
    