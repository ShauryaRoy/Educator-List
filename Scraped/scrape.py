import requests
from bs4 import BeautifulSoup
import json

# List of URLs to scrape
urls = [

"https://chennai.vit.ac.in/member/dr-senthil-kumar-n/",
"https://chennai.vit.ac.in/member/dr-hemamalini-s/",
"https://chennai.vit.ac.in/member/dr-lenin-n-c/",
"https://chennai.vit.ac.in/member/dr-nithya-venkatesan/",
"https://chennai.vit.ac.in/member/dr-peer-fathima-a/",
"https://chennai.vit.ac.in/member/dr-prabhakar-m/",
"https://chennai.vit.ac.in/member/dr-premalatha-l/",
"https://chennai.vit.ac.in/member/dr-sreedevi-v-t/",
"https://chennai.vit.ac.in/member/dr-deepa-t/",
"https://chennai.vit.ac.in/member/dr-febin-daya-j-l/",
"https://chennai.vit.ac.in/member/dr-jamuna-k/",
"https://chennai.vit.ac.in/member/dr-subbulekshmi-d/",
"https://chennai.vit.ac.in/member/dr-angeline-ezhilarasi-g/",
"https://chennai.vit.ac.in/member/dr-arul-r/",
"https://chennai.vit.ac.in/member/dr-binu-ben-jose-d-r/",
"https://chennai.vit.ac.in/member/dr-chendur-kumaran-r/",
"https://chennai.vit.ac.in/member/dr-gnana-swathika-o-v/",
"https://chennai.vit.ac.in/member/dr-gunabalan-r/",
"https://chennai.vit.ac.in/member/dr-iyswarya-annapoorani-k/",
"https://chennai.vit.ac.in/member/dr-jayapragash-r/",
"https://chennai.vit.ac.in/member/dr-kanimozhi-g/",
"https://chennai.vit.ac.in/member/dr-sri-revathi-b/",
"https://chennai.vit.ac.in/member/dr-sumathi-v/",
"https://chennai.vit.ac.in/member/dr-umayal-c/",
"https://chennai.vit.ac.in/member/dr-vaithilingam-c/",
"https://chennai.vit.ac.in/member/dr-aravind-c-k/",
"https://chennai.vit.ac.in/member/dr-meenakshi-j/",
"https://chennai.vit.ac.in/member/dr-mohamed-imran-a/",
"https://chennai.vit.ac.in/member/dr-balamurugan-p/",
"https://chennai.vit.ac.in/member/dr-sri-ramalakshmi-p/",
"https://chennai.vit.ac.in/member/dr-angalaeswari-s/",
"https://chennai.vit.ac.in/member/dr-kuruseelan-s/",
"https://chennai.vit.ac.in/member/dr-lavanya-v/",
"https://chennai.vit.ac.in/member/dr-meera-p-s/",
"https://chennai.vit.ac.in/member/dr-nilanjan-tewari/",
"https://chennai.vit.ac.in/member/dr-sitharthan-r/",
"https://chennai.vit.ac.in/member/prof-srimathi-r/",
"https://chennai.vit.ac.in/member/prof-anantha-krishnan-v/",
"https://chennai.vit.ac.in/member/dr-inayathullah-abdul-kareem/",
"https://chennai.vit.ac.in/member/dr-jyotismita-mishra/",
"https://chennai.vit.ac.in/member/dr-mithu-sarkar/",
"https://chennai.vit.ac.in/member/dr-pritam-bhowmik/",
"https://chennai.vit.ac.in/member/dr-senthil-kumar-r/",
"https://chennai.vit.ac.in/member/dr-anand-kumar/",
"https://chennai.vit.ac.in/member/dr-anik-goswami/",
"https://chennai.vit.ac.in/member/dr-balakumar-p/",
"https://chennai.vit.ac.in/member/dr-nawin-r-a/",
"https://chennai.vit.ac.in/member/dr-nitin-kumar-kulkarni/",
"https://chennai.vit.ac.in/member/dr-rupa-mishra/",
"https://chennai.vit.ac.in/member/dr-swetha-r-kumar/",
"https://chennai.vit.ac.in/member/prof-krishna-kumba/",
"https://chennai.vit.ac.in/member/dr-sushmi-n-b/",
"https://chennai.vit.ac.in/member/prof-abhirami-an/",
"https://chennai.vit.ac.in/member/prof-anu-shalini/",
"https://chennai.vit.ac.in/member/prof-ashly-mary-tom/",
"https://chennai.vit.ac.in/member/prof-manish-kumar-dwivedi/",
"https://chennai.vit.ac.in/member/prof-marabathina-maheedhar/",
"https://chennai.vit.ac.in/member/prof-mohamed-abdullah-j/",
"https://chennai.vit.ac.in/member/prof-mohana-preethi-v/",
"https://chennai.vit.ac.in/member/prof-prasath-t/",
"https://chennai.vit.ac.in/member/prof-r-dhanesh/",
"https://chennai.vit.ac.in/member/prof-rajaguru-veeracholan-v/",
"https://chennai.vit.ac.in/member/prof-rani-s/",
"https://chennai.vit.ac.in/member/prof-shri-saranyaa-j/",
"https://chennai.vit.ac.in/member/prof-subashini/",
"https://chennai.vit.ac.in/member/prof-vimala-gayathri-s-2/",
"https://chennai.vit.ac.in/member/mr-paul-mathew/",
"https://chennai.vit.ac.in/member/mr-sabavath-jayaram/",
"https://chennai.vit.ac.in/member/mr-selvasundar-k/",
"https://chennai.vit.ac.in/member/ms-a-archana/",
"https://chennai.vit.ac.in/member/ms-arputhamary-t/",
"https://chennai.vit.ac.in/member/ms-b-brindha/",
"https://chennai.vit.ac.in/member/ms-maladhi-d/",
"https://chennai.vit.ac.in/member/ms-parulekar-samata-sadashiv/",
"https://chennai.vit.ac.in/member/ms-vishnupriya-b/",

]

# Initialize an empty list to store scraped data
scraped_data = []

# Function to scrape name and image from a URL
def scrape_member_details(url):
    response = requests.get(url, verify=False)  # Disable SSL verification for this example
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the name using the class 'item-title'
        name_tag = soup.find('h3', class_='item-title')  # Use h2 or adjust based on the structure
        name = name_tag.get_text(strip=True) if name_tag else 'No name found'

        # Find the image URL
        image_tag = soup.find('img', class_='wp-post-image')  # Adjust this based on actual structure
        image_url = image_tag['src'] if image_tag else 'No image found'

        # Return the scraped details as a dictionary
        return {
            'name': name,
            'image_url': image_url
        }
    else:
        print(f"Failed to retrieve {url}")
        return None

# Scrape each URL and collect the data
for url in urls:
    member_details = scrape_member_details(url)
    if member_details:
        scraped_data.append(member_details)

# Output the scraped data as JSON
with open('scraped_data.json', 'w') as json_file:
    json.dump(scraped_data, json_file, indent=4)

print("Data scraped successfully and saved to 'scraped_data.json'")
