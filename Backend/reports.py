from database import get_connection
import mysql.connector

def get_history():
    cursor=None
    conn=None
    try:
        conn=get_connection()
        if conn.is_connected():
            print("Success!")
        
        cursor=conn.cursor(dictionary=True)
        cursor.execute(
            '''
            SELECT
            al.log_id,
            br.request_id AS req_id,
            al.old_status,
            al.new_status,
            u.user_name AS changed_by,
            al.changed_at
            FROM activity_logs al
            JOIN borrow_requests br
                ON al.request_id = br.request_id
            JOIN users u
                ON al.changed_by = u.user_id;
            '''
            
        )
        result=cursor.fetchall()
        return result     
    except mysql.connector.Error as e:
        print(e)
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected:
            conn.close()