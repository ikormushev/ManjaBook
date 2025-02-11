# ManjaBook
🍲 **ManjaBook** is a modern web application for creating, sharing, and managing recipes. Whether you're an aspiring home cook or a seasoned chef, ManjaBook provides an intuitive interface to build your personal cookbook, discover new recipes, and connect with other food enthusiasts.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Pages](#pages)
- [Authentication](#authentication)

## Features
- **User Authentication:** Secure login and registration using HTTP cookies and JWT tokens.
- **Recipe Creation:** Authenticated users can create recipes by providing:
  - A photo
  - Title
  - Catchy description for the recipe
  - Detailed preparation instructions
  - A custom product selection tab to either choose from an existing list or add new products on the fly
  - Cooking and preparation time
- **Recipe Browsing:** Explore a diverse collection of recipes posted by the community.
- **User Profiles:**
  - View recipes created by a specific user along with their public collections.
  - If viewing your own profile, you can update your profile photo, edit your username, or delete your profile.
- **Public Collections:** Organize and display recipes in collections for easy browsing.

## Technologies Used
- **Backend:** [Django](https://www.djangoproject.com/) – Robust and scalable Python web framework.
- **Frontend:** [React](https://reactjs.org/) – Library for building dynamic user interfaces.
- **Database:** [PostgreSQL](https://www.postgresql.org/) – Advanced open-source relational database.
- **Object Storage:** [MinIO](https://min.io/) – High-performance, S3-compatible storage for managing images.
- **UI Framework:** [Material UI (MUI)](https://mui.com/) – Component library for React that speeds up development.

## Pages
- **Home:**  
  The landing page offering an overview of ManjaBook and its features.
  ![home1](https://github.com/user-attachments/assets/660a3c49-25e6-4e3f-a93b-4456136f1ca9)
  ![home2](https://github.com/user-attachments/assets/47195847-40eb-44c6-bcde-502813111afb)

- **Recipes:**  
  Browse and search through a variety of recipes contributed by the community.
  ![recipes](https://github.com/user-attachments/assets/5b916d6c-95b8-43ae-bb3b-ac4418cb6af9)

- **Profiles:**
  Browse and search through all of the profiles created on the website.
  ![profiles](https://github.com/user-attachments/assets/23d52d64-7c40-4b96-bcc4-ffde833b7ee4)

- **User Profile:**  
  View user profiles that list:
  - Recipes created by the user
  - Public collections of recipes  
  If it’s your own profile, you have the ability to edit your profile details or delete your account.
  ![profile](https://github.com/user-attachments/assets/e9142b0b-e856-4b3c-a7f3-dc136fc1e777)

- **Create a Recipe Page:**  
  Accessible only to authenticated users. This page allows you to create a new recipe by uploading a photo, entering a title and a catchy short description, detailing the preparation steps, selecting products (with a custom tab that lets you choose from a pre-defined list or add new ones), and specifying the time to cook and prepare.
  ![recipe_creation](https://github.com/user-attachments/assets/c63dd6d5-28ab-4cb1-b880-d75c712a871e)
  ![recipe_creation1](https://github.com/user-attachments/assets/f80f33f7-960a-4b30-a508-84cf2fe98333)
  ![recipe_creation2](https://github.com/user-attachments/assets/11377f49-7d0e-456d-be8e-b9242c7fbf8e)
  ![recipe_creation3](https://github.com/user-attachments/assets/dfd0f06c-0066-44cf-87d3-96716c1d484c)

- **Authentication Pages:**  
  - **Login Page:** Allows existing users to sign in.
    ![login](https://github.com/user-attachments/assets/7a4e3995-bea6-4710-bc55-35b49f5a4a7b)

  - **Register Page:** Enables new users to create an account.
    ![register](https://github.com/user-attachments/assets/2881fb1f-209d-4b29-9b78-5627081a4271)

## Authentication
ManjaBook uses a combination of **HTTP cookies** and **JWT tokens** for secure authentication. This setup allows the backend to securely manage sessions and ensure that only authenticated users can create or modify recipes and profiles.
