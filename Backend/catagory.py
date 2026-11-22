from database import get_connection
import mysql.connector

def add_catagory(c_name,c_description):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('INSERT INTO `item_categories`(`c_name`, `c_description`) VALUES (%s,%s)',(c_name,c_description))
        conn.commit()
        if cursor.rowcount>0:
           return{
               'success':True,
               'message':'Added Catagory!'
           } 
        else:
            return{
                'success':False,
                'details':'Couldn,t add Catagory!'
            } 
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
        return{
            'success':False,
            'details':'Database Error!'
        } 
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            
def update_catagory(c_id,c_name,c_description):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('UPDATE `item_categories` SET `c_name`=%s,`c_description`=%s WHERE c_id=%s',(c_name,c_description,c_id))
        conn.commit()
        if cursor.rowcount>0:
           return{
               'success':True,
               'message':'Updated Catagory!'
           } 
        else:
            return{
                'success':False,
                'details':'Couldn,t update Catagory!'
            } 
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
        return{
            'success':False,
            'details':'Database Error!'
        } 
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def get_all_catagories():
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM item_categories')
        return cursor.fetchall()
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()