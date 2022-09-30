from http.client import HTTPResponse
import requests
from bs4 import BeautifulSoup
from django.shortcuts import render

page = requests.get('https://www.imdb.com/chart/top/') # Getting page HTML through request

soup = BeautifulSoup(page.content, 'html.parser') # Parsing content using beautifulsoup
links = soup.select("table tbody tr td.titleColumn a") # Selecting all of the anchors with titles4

titles = []
first10 = links[:10] # Keep only the first 10 anchors
for anchor in first10:
    titles.append(anchor.text)

print(titles) # Display the innerText of each anchor

html = open('index.html', 'r').read().format(titles=titles)
