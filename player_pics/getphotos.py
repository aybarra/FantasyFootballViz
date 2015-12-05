from urllib2 import Request, urlopen
import urllib
import json
from time import sleep

pic_url = "http://d395i9ljze9h3x.cloudfront.net/images-003/headshots/"

pguid = 'MannPe00'


headers = {
  'Accept': 'application/json'
}

#urllib.urlretrieve(, "Mann.jpg")

urlpath = 'http://localhost:8000/careers/?page=2'
request = Request(urlpath, headers=headers)
response_body = urlopen(request).read()
data = json.loads(response_body)


for item in data['results'] :
    if item['active'] == True : 
        pguid = item['pguid']
        print pguid
        url = pic_url + pguid + '.jpg'
        #print url
        filename = pguid + '.jpg'
        urllib.urlretrieve(url, filename)
        sleep(0.05)

                



