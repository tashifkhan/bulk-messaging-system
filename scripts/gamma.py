'''
Design a Whatsapp Messaging System.
    A service in which user can send a message to all the whatsapp number present in csv file
    A service in which user can schedule the message to be sent at particular time to all the whatsapp number specified
    A service which allows you to filter specific phone numbers from the csv/excel file to send the message
'''

# Include all the necessary libraries from selenium/webdriver
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By

# Include all the other required libraries
import schedule
import time
import pandas as pd
from datetime import datetime, timedelta, time
from urllib.parse import quote

# Function to open WhatsApp Web in the browser
def open_whastapp():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install())) # Install/Creating a new instance of ChromeDriver
    link = "https://web.whatsapp.com/"
    driver.get(link)
    time.sleep(15)

# Function to send a message on whatsapp
def send_message(number, message, country_code="91"):
    _message = quote(message)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install())) # Install/Creating a new instance of ChromeDriver
    link = f"https://web.whatsapp.com/send?phone={country_code}{number}&text={_message}" # URL to send a message to a number
    driver.get(link)
    time.sleep (5) # Wait for 5 seconds to load the page
    action = ActionChains (driver) 
    action.send_keys (Keys. ENTER) 
    action.perform() 
    time.sleep (5) # Wait for 5 seconds to confirm the message is sent

# Function to send messages to all the numbers in a CSV file
def send_messages_csv_all(file_path, message, column_name='Phone No.'):
    try:
        df = pd.read_csv(file_path)
        numbers = df['Phone No.'].tolist()
        for number in numbers:
            send_message(number, message)

    except pd.errors.EmptyDataError:
        print("Error: The CSV file is empty.")

    except KeyError:
        print(f"Error: There is no column named '{column_name}' in the Excel file.")
        print("Please check the Excel file and try again.")
        print(f"If you find that the column name is different, please change it to '{column_name}' and try again.")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Function to send messages to all the numbers in a Excel file
def send_messages_excel_all(file_path, message, column_name='Phone No.'):
    try:
        df = pd.read_excel(file_path)
        numbers = df[column_name].tolist()
        for number in numbers:
            send_message(number, message)

    except pd.errors.EmptyDataError:
        print("Error: The Excel file is empty.")

    except KeyError:
        print(f"Error: There is no column named '{column_name}' in the Excel file.")
        print("Please check the Excel file and try again.")
        print(f"If you find that the column name is different, please change it to '{column_name}' and try again.")
        
    except Exception as e:
        print(f"An unexpected error occurred: {e}")