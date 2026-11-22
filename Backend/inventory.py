from database import get_connection
import mysql.connector


def add_item(catagory,item_name,item_description,item_condition,created_by):
    cursor=None
    conn=None
    try:
        query="INSERT INTO inventory_items (category, item_name, item_description ,item_condition, created_by) VALUES (%s,%s,%s,%s,%s)"
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query,(catagory,item_name,item_description,item_condition,created_by))
        conn.commit()
        if cursor.rowcount>0:
            print("Successfully added record!")
            return{
                'success':True,
                'message':'Added item successfully!'     
            }
        return {
            "success": False,
            "message": "Unable to add item."
        }
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
        
def get_all_items():
    cursor=None
    conn=None
    try:
        query='''
        SELECT
        i.item_id,
        i.item_name,
        i.item_description,
        i.item_condition,
        i.availability,
        i.created_at,
        i.updated_at,
        u.user_name AS created_by_name,
        c.c_name
        FROM inventory_items AS i
        LEFT JOIN users AS u
            ON i.created_by = u.user_id
        LEFT JOIN item_categories AS c
            ON i.category = c.c_id;
        '''
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        item=cursor.fetchall()
        return item
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()
    
def update_item(catagory,item_name,item_description,item_condition,availability,item_id):
    cursor=None
    conn=None
    try:
        query="UPDATE inventory_items SET category=%s,item_name=%s,item_description=%s,item_condition=%s,availability=%s where item_id=%s"
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute(query,(catagory,item_name,item_description,item_condition,availability,item_id))
        conn.commit()
        return{
            'success':True,
            'message':'Updated successfully'
        }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'message':'Database Error'
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()
    