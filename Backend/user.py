from database import get_connection
import mysql.connector
from argon2 import PasswordHasher,exceptions
import re

def validate_password(password):
        if(len(password)<8):
            return False
        if not re.search(r"[A-Z]",password):
            return False
        if not re.search(r"[a-z]",password):
            return False
        if not re.search(r"[0-9]",password):
            return False
        if not re.search(r"[^A-Za-z0-9]",password):
            return False
        return True

def get_total_users():
    cursor=None
    conn=None
    try:
        query='SELECT COUNT(*) from users'
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute(query)
        users=cursor.fetchone()
        return users[0]
    
    except mysql.connector.Error as e:
        print("Database error:", e)
    
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def get_inventory_count():
    cursor=None
    conn=None
    try:
        conn=get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        cursor=conn.cursor()
        cursor.execute('SELECT COUNT(*) from inventory_items')
        total= cursor.fetchone()
        return total[0]

    except mysql.connector.Error as e:
        print(e)
          
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected:
            conn.close()

def get_total_requests():
    cursor=None
    conn=None
    try:
        conn=get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        cursor=conn.cursor()
        cursor.execute('SELECT COUNT(*) from borrow_requests')
        total= cursor.fetchone()
        return total[0]

    except mysql.connector.Error as e:
        print(e)
            
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected:
            conn.close()

def get_total_loans():
    cursor=None
    conn=None
    try:
        conn=get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        cursor=conn.cursor()
        cursor.execute('SELECT COUNT(*) from loan_transactions')
        total= cursor.fetchone()
        return total[0]

    except mysql.connector.Error as e:
        print(e)
            
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected:
            conn.close()


def login_user(email,password):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        query='SELECT user_id, user_name, email, password, role, is_logged_in FROM users WHERE BINARY email=BINARY %s;'
        cursor.execute(query,(email,))
        result=cursor.fetchone()
            
        if result:
            ph=PasswordHasher()
            try:
                ph.verify(result["password"],password)
                cursor.execute("UPDATE users SET is_logged_in = TRUE WHERE user_id = %s",(result["user_id"],))
                # result["is_logged_in"]=True
                conn.commit()
                print("Logged In successfully!!")
                return {
                    "success": True,
                    "message": "logged in successfully!",
                    "user": {
                        "user_id": result["user_id"],
                        "user_name": result["user_name"],
                        "email": result["email"],
                        "role": result["role"]
                    }
                }
            except exceptions.VerifyMismatchError:
                if conn:
                    conn.rollback()
                print("Wrong password!")
                return {
                    "success": False,
                    "message": "Invalid password"
                }
        else:
            return{
                'success':False,
                "message":"Invalid email or password"
            }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return {
            "success": False,
            "message": "Database connection failed"
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def logout_user(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_logged_in = False WHERE user_id = %s",(user_id,))
        # result["is_logged_in"]=False
        conn.commit()
        if cursor.rowcount > 0:
            print("Logged out successfully!")
            return{
                "success": True,
                "message": "Logged out successfully!"
            }
        else:
            conn.rollback()
            return {
                "success": False,
                "message": "User not found or already logged out!"
            }
            # print("User not found or already logged out!")
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return {
            "success": False,
            "message": "Database error occurred."
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def get_user_by_id(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT user_name,email,role FROM `users` WHERE user_id=%s",(user_id,))
        result=cursor.fetchone()
        return result
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def get_users():
    cursor=None
    conn=None
    try:
        query='SELECT * FROM users'
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        users=cursor.fetchall()
        return users
        # for user in users:
        #     if user["role"]=='student':
        #         print(user["user_name"])
        #     print(f"{user["user_id"]}\t{user["user_name"]}\t{user["email"]}\t{user["role"]}")

            
    except mysql.connector.Error as e:
        print("Database error:", e)
    
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def delete_user(user_id):
    cursor=None
    
    try:
        query="DELETE FROM users WHERE user_id = %s"
        conn=get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor=conn.cursor()
        cursor.execute(query,(user_id,))
        conn.commit()
        
    except mysql.connector.Error as e:
        print("Database error:", e)
        conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def insert_user(user_name,email,password,role):
    cursor=None
    conn=None
    try:
        query='INSERT INTO users (user_name, email, password, role) VALUES (%s,%s,%s,%s);'
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        if validate_password(password):
            ph = PasswordHasher()
            hashed = ph.hash(password)
        else:
            print("Password not allowed!")
            return{
                'success':False,
                'details':"Password doesn't meet requirements"
            }
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = %s ;",(email,))
        if cursor.fetchone():
            print("Email existed")
            return {
                "success": False,
                "details": "Email already registered"
            }
            
        cursor.execute(query,(user_name,email,hashed,role))
        if cursor.rowcount>0:
            conn.commit()
            print("Added successfully!")
            return {
                "success": True,
                "message": "Successfully added!"
            }
        else:
            conn.rollback()
            return {
                "success": False,
                "details": "Couldn't add user"
            }

    except mysql.connector.Error as e:
        print("Database error:", e)
        if conn:
            conn.rollback()
        return {
            "success": False,
            "details": "Unable to add user."
        }

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()
            
def update_user(user_id,user_name,email,role,change):
    cursor=None
    conn=None
    try:
        query='UPDATE `users` SET `user_name`=%s,`email`=%s,`role`=%s where user_id = %s;'
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        if change:
            cursor.execute("SELECT * FROM users WHERE email = %s and not user_id=%s;",(email,user_id))
            if cursor.fetchone():
                print("Email existed")
                return {
                    "success": False,
                    "message": "Email already registered"
                }
            
        cursor.execute(query,(user_name,email,role,user_id))
        conn.commit()
        print("Updated successfully!")
        return {
            "success": True,
            "message": "Successfully saved!"
        }

    except mysql.connector.Error as e:
        print("Database error:", e)
        if conn:
            conn.rollback()
        return {
            "success": False,
            "message": "Unable to update user."
        }

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()
            

