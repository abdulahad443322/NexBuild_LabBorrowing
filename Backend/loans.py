from database import get_connection
import mysql.connector
# from datetime import date,timedelta


def loan_update(request_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        
        cursor = conn.cursor(dictionary=True)

        cursor.execute('SELECT * FROM `loan_transactions` WHERE request_id=%s;',(request_id,))
        if cursor.fetchall():
            return{
                'success':True,
                'message':"Already issued!"
            }
            
        else:
            conn.rollback()
            return{
                'success':False,
                'details':""
            }
         
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'details':'Connection Error!'
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            
def issue_item(request_id,item_id, staff_id,due_date):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("select role from users where user_id=%s",(staff_id,))
        r=cursor.fetchone()
        if not r or r["role"] not in ("staff", "admin"):
            print("Unauthorized user!")
            return {
                'success': False,
                'details':'Unauthorized user'
            }
        
        cursor.execute("SELECT request_id FROM borrow_requests WHERE request_id = %s AND status = 'approved';",(request_id,))
        if not cursor.fetchone():
            print("Request is not approved!")
            return {
                'success':False,
                'details':'Request is pending!'
            }
        
        cursor.execute("SELECT loan_id FROM loan_transactions WHERE request_id = %s ", (request_id,))
        if cursor.fetchone():
            print("Already issued!")
            return {
                'success':False,
                'details':'Already issued!'
            }
        # day=date.today() + timedelta(days=10)
        query='INSERT INTO `loan_transactions`(`request_id`, `issued_by`, `due_date`) VALUES (%s,%s,%s)'
        cursor.execute(query,(request_id, staff_id,due_date))
        conn.commit()
        if cursor.rowcount>0:
            cursor.execute('UPDATE `inventory_items` SET `availability`= borrowed WHERE item_id=%s',(item_id,))
            conn.commit()
            
            print("Issued successfully")
            return{
                'success':True,
                'message':'Issued successfully!'
            }
        else:
            conn.rollback()
         
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'details':'Connection Error!'
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
        
def return_item(staff_id ,item_id,return_condtion,notes,loan_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("select role from users where user_id=%s",(staff_id,))
        r=cursor.fetchone()
        if not r or r["role"] not in ("staff", "admin"):
            print("Unauthorized user!")
            return{
                'success':False,
                'details':'Unauthorized user!'
            }
        
        cursor.execute("UPDATE loan_transactions SET is_returned=True ,returned_at=CURRENT_TIMESTAMP , received_by=%s , return_condition=%s , notes=%s WHERE loan_id=%s AND is_returned = FALSE",(staff_id,return_condtion,notes,loan_id))
        # cursor.fetchone()
        conn.commit()
        if cursor.rowcount>0:
            cursor.execute("UPDATE `inventory_items` SET `availability`= 'available' WHERE item_id=%s",(item_id,))
            conn.commit()
            print("Returned successfully")
            return{
                'success':True,
                'message':'Returned successfully'
            }
        else:
            print("Loan not found or already issued!")
            conn.rollback()
            return{
                'success':False,
                'details':'Loan not found or already issued!'
            }
        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return{
            'success':False,
            'details':'Database error!'
        }

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()        

def get_loan_history():
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT lt.loan_id,i.item_id,u.user_name,i.item_name,lt.issued_at,lt.due_date,lt.is_returned
            FROM `loan_transactions` lt
            JOIN borrow_requests br ON br.request_id=lt.request_id
            JOIN users u ON u.user_id=br.borrower_id
            JOIN inventory_items i ON i.item_id=br.item_id ORDER BY lt.issued_at DESC
            ''')
        result=cursor.fetchall()
        return result
        # for r in result:
            # if r:
            #     print(f"{r["loan_id"]}\t{r['user_name']}\t{r['item_name']}\t{r["due_date"]}\t{r["is_returned"]}")
            
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        return []
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT lt.loan_id,u.user_name,i.item_name,lt.issued_at,lt.due_date
            FROM `loan_transactions` lt
            JOIN borrow_requests br ON br.request_id=lt.request_id
            JOIN users u ON u.user_id=br.borrower_id
            JOIN inventory_items i ON i.item_id=br.item_id
            WHERE lt.is_returned=false and lt.due_date<curdate()
            ''')
        result=cursor.fetchall()
        for r in result:
            if r:
                print(f"{r["loan_id"]}\t{r['user_name']}\t{r['item_name']}\t{r["due_date"]}")

        
    except mysql.connector.Error as e:
        if conn:
            conn.rollback()
        print("Database error: ",e)
        
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
          
def get_user_loan_count(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute('''
                    SELECT COUNT(*)
                    FROM loan_transactions lt
                    JOIN borrow_requests br ON br.request_id = lt.request_id
                    WHERE br.borrower_id = %s
                    AND lt.is_returned = FALSE;
                '''
                       
            ,(user_id,))
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
                 
def get_returned_loan_count(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor()
        cursor.execute('''
                    SELECT COUNT(*)
                    FROM loan_transactions lt
                    JOIN borrow_requests br ON br.request_id = lt.request_id
                    WHERE br.borrower_id = %s
                    AND lt.is_returned = TRUE;
                '''
                       
            ,(user_id,))
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
                     
def get_user_loan(user_id):
    cursor=None
    conn=None
    try:
        conn = get_connection()
        if conn.is_connected():
            print("Database connected successfully!")
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
                SELECT
                    lt.loan_id,
                    u.user_name,
                    i.item_name,
                    lt.issued_at,
                    lt.due_date,
                    lt.is_returned
                FROM loan_transactions lt
                JOIN borrow_requests br ON br.request_id = lt.request_id
                JOIN users u ON u.user_id = br.borrower_id
                JOIN inventory_items i ON i.item_id = br.item_id
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
            
            