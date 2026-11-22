from database import get_connection
import mysql.connector


def create_borrow_request(borrower_id,item_id):
    cursor=None
    conn=None
    try:
        
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT request_id
            FROM borrow_requests
            WHERE borrower_id = %s
            AND item_id = %s
            AND status IN ('pending', 'approved')
            """,
            (borrower_id, item_id)
        )

        response=cursor.fetchall()
        if response:
            return {
                'success': False,
                'details': 'Request already exists.'
            }
        
        cursor.execute("INSERT INTO borrow_requests( borrower_id, item_id) VALUES (%s,%s);",(borrower_id,item_id))
        conn.commit()
        if cursor.rowcount>0:
            print("Successfully added record!")
            return{
                'success':True,
                'message':'Request successfull!'     
            }
        return {
            "success": False,
            "details": "Unable to request!"
        }
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return {
            "success": False,
            "details": "Database error occurred."
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def get_requests():
    cursor=None
    conn=None
    try:
        query='''
        SELECT br.request_id,br.item_id, borrower.user_name AS borrower_name, item.item_name, br.status, br.request_time, reviewer.user_name AS reviewed_by, br.staff_note
        FROM borrow_requests AS br
        JOIN users AS borrower
        ON br.borrower_id = borrower.user_id
        JOIN inventory_items AS item
        ON br.item_id = item.item_id
        LEFT JOIN users AS reviewer
        ON br.reviewed_by = reviewer.user_id;
        '''
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        return cursor.fetchall()
        # print(f"{item["borrower_name"]}\t{item["item_name"]}\t{item["status"]}")
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def approve_request(request_id,item_id,reviewed_by):
    cursor=None
    conn=None
    try:
        query="UPDATE borrow_requests SET status = 'approved' ,reviewed_by=%s ,review_time = CURRENT_TIMESTAMP WHERE request_id = %s and item_id=%s and status = 'pending'"
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query,(reviewed_by ,request_id,item_id))
        if cursor.rowcount > 0:
            conn.commit()
            print("Request approved successfully!")
            return{
                'success':True,
                'message':"Request approved successfully!"
            }
        else:
            conn.rollback()
            print("Request not found or it is not pending.")
            return{
                'success':False,
                'details':"Request not found or it is not pending!"
            }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'details':"Database error! "
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            
def reject_request(request_id,item_id,reviewed_by):
    cursor=None
    conn=None
    try:
        query="UPDATE borrow_requests SET status = 'rejected' ,reviewed_by=%s ,review_time = CURRENT_TIMESTAMP WHERE request_id = %s and item_id=%s and status = 'pending'"
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query,(reviewed_by ,request_id,item_id))
        if cursor.rowcount > 0:
            conn.commit()
            print("Request rejected successfully!")
            return{
                'success':True,
                'message':"Request rejected successfully!"
            }
        else:
            conn.rollback()
            print("Request not found or it is not pending.")
            return{
                'success':False,
                'details':"Request not found or it is not pending!"
            }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'details':"Database error! "
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

def cancel_request(request_id,borrower_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT borrower_id FROM borrow_requests WHERE request_id = %s", (request_id,)
        )
        result=cursor.fetchone()
        # print(data[1])
        # print(result["borrower_id"])
        
        if result["borrower_id"]==borrower_id:
            
            query="UPDATE borrow_requests SET status = 'cancelled',review_time=CURRENT_TIMESTAMP WHERE request_id = %s AND borrower_id = %s AND status = 'pending';"
            cursor.execute(query,(request_id,borrower_id))
            if cursor.rowcount > 0:
                conn.commit()
                print("Request cancelled!")
                return {
                    "success": True,
                    "message": "Request cancelled successfully"
                }
            else:
                conn.rollback()
                print("Request not found or it is not pending.")
                return {
                "success": False,
                "message": "Request not found or it is not pending"
            }
        else:
            print("Requested id dont match borrower!")
            return {
            "success": False,
            "message": "Requested id dont match borrower"
        }
            
        
    except mysql.connector.Error as e:
        if conn :
            conn.rollback()
        print("Database error: ",e)
        return {
            "success": False,
            "message": "Database error"
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()

# SELECT COUNT(*) FROM `borrow_requests` WHERE borrower_id=40;
def get_user_request_count(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM `borrow_requests` WHERE borrower_id=%s;",(user_id,))
        result=cursor.fetchone()
        return result[0]
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
        return 0
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()

def get_user_requests(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
                SELECT
                br.request_id,
                borrower.user_name AS borrower_name,
                i.item_name,
                br.status,
                br.request_time,
                reviewer.user_name AS reviewer_name
            FROM borrow_requests br
            JOIN users borrower
                ON borrower.user_id = br.borrower_id
            JOIN inventory_items i
                ON i.item_id = br.item_id
            LEFT JOIN users reviewer
                ON reviewer.user_id = br.reviewed_by
            WHERE br.borrower_id = %s;
                '''    
            ,(user_id,))
        result=cursor.fetchall()
        return result
        
    except mysql.connector.Error as e:
        print("Database error: ",e)
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():    
            conn.close()
