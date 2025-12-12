# 🎨 WallPix Server

This is the backend server for the WallPix Wallpaper App. It provides a simple REST API to fetch wallpapers and categories.

##  Project Structure (What is for what?)

Here is a simple explanation of the files and folders:

*   **`src/index.js`**: 
    *   This is the **Main Entry Point**. It starts the server, sets up the port (5000), and loads the routes. Think of it as the "Front Door" of the application.
*   **`src/routes/wallpaperRoutes.js`**: 
    *   This file defines the **URL Paths** (Endpoints). It tells the server: "When someone goes to `/api/wallpapers`, run this function."
*   **`src/controllers/wallpaperController.js`**: 
    *   This contains the **Logic**. It handles the actual work of fetching data, filtering it, and sending it back to the user.
*   **`src/data/db.json`**: 
    *   This is your **Wallpaper Database**. It contains the list of wallpapers and categories.
*   **`src/data/users.json`**: 
    *   This is your **User Database**. It safely stores user accounts and encrypted passwords.
*   **`src/controllers/authController.js`**: 
    *   Handles User Login, Signup, Profile updates, and Account deletion logic.
*   **`package.json`**: 
    *   This lists the **Dependencies** (libraries) the project needs, like `express`, `cors`, `bcryptjs`, and `jsonwebtoken`.

## 🚀 How to Run

1.  **Install Dependencies** (First time only):
    ```bash
    npm install
    ```
2.  **Start the Server**:
    ```bash
    npm run dev
    ```
    *   The server will start at: `http://localhost:5000`

## 🔌 API Endpoints

You can use these URLs in your Flutter app or browser:

| Method | Endpoint | Description |
| :--- | :--- | :--- |

## Wallpaper/Categories : 
1. | `GET` | `/api/wallpapers` | Get a list of all wallpapers (Merged local + external logic removed). |

2. | `GET` | `/api/wallpapers?category=Nature` | Get wallpapers filtered by category (e.g., Nature). |

3. | `GET` | `/api/wallpapers?device=mobile` | Get wallpapers filtered by device (mobile, desktop, tablet). |

4. | `GET` | `/api/wallpapers/1` | Get details of a single wallpaper by ID. |

5. | `GET` | `/api/categories` | Get the list of wallpaper categories (Dynamically generated). |

## User Auth : 
6. | `POST` | `/api/auth/signup` | Create a new user account. Body: `{ "email": "...", "password": "..." }` |

7. | `POST` | `/api/auth/login` | Login to get a token. Body: `{ "email": "...", "password": "..." }` |

8. | `GET` | `/api/auth/profile` | Get current user details. Requires Header: `Authorization: Bearer <token>` |

9. | `PUT` | `/api/auth/profile` | Update profile. Body: `{ "username": "...", "email": "...", "password": "..." }` |

10. | `GET` | `/api/auth/users` | **[NEW]** Get a list of ALL registered users (includes download/fav counts & full details). |

11. | `GET` | `/api/auth/delete-otp` | Request OTP to delete account. Returns OTP in response. Requires Header: `Authorization: Bearer <token>` |

12. | `DELETE` | `/api/auth/delete-account` | Delete account. Body: `{ "otp": "123456" }` Requires Header: `Authorization: Bearer <token>` |


## Download Details : 
13. | `POST` | `/api/auth/downloads` |Record a wallpaper download. Body: `{ "wallpaperId": 1 }` Requires Header: `Authorization: Bearer <token>` |

14. | `GET` | `/api/auth/downloads` | Get download history for the current user. Requires Header: `Authorization: Bearer <token>` |

## Favourite Details : 

15.| `GET` | `/api/favorites` | Get favorite wallpapers(User identified by Token). Requires Header: `Authorization: Bearer <token>` |

16. | `POST` | `/api/favorites` | Add to YOUR favorites. Body: `{ "wallpaperId": 1 }` Requires Header: `Authorization: Bearer <token>` |

17. | `DELETE` | `/api/favorites/{wallpaperId}` | Remove from YOUR favorites. Requires Header: `Authorization: Bearer <token>` |

## ✏️ How to Add Wallpapers

1.  Open `src/data/db.json`.
2.  Find the `"wallpapers"` array.
3.  Add a new object like this:
    ```json
    {
      "id": 7,
      "title": "New Cool Image",
      "imageUrl": "https://example.com/image.jpg",
      "category": "Abstract",
      "downloads": 0
    }
    ```
4.  Save the file. The server will update automatically!

## 🔐 Authentication & OTP

This server uses **JWT (JSON Web Tokens)** for security.

1.  **Signup/Login**: You get a `token` in the response.
2.  **Access Profiles**: Send this token in the header of protected requests:
    `Authorization: Bearer <your_token_here>`

### 📧 How Delete Account Works (Mock OTP)
Since this is a local development server, it simulates sending emails.
1.  Call `/api/auth/delete-otp`.
2.  Look at the **VS Code Terminal** (where the server is running).
3.  You will see a log like: `📧 [MOCK EMAIL SERVICE] Sending Delete OTP to user@...: 123456`.
4.  Use that code to call `/api/auth/delete-account`.
