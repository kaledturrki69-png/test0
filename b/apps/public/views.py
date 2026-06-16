from django.shortcuts import render
from datetime import datetime

def home(request):
    return render(request, 'public/home.html', {'now': datetime.now()})
