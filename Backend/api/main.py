from fastapi import FastAPI,HTTPException,Depends
from pydantic import BaseModel
from auth import create_access_token,verify_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal
from datetime import date
from user import login_user,logout_user,get_total_users,get_inventory_count,get_total_requests,get_users,insert_user,update_user
from reports import get_history
from inventory import get_all_items,add_item,update_item
from borrowing import get_requests,get_user_request_count,get_user_requests,create_borrow_request,approve_request,reject_request,cancel_request
from loans import issue_item,get_loan_history,get_user_loan_count,get_user_loan,get_returned_loan_count,loan_update,return_item
from catagory import get_all_catagories,add_catagory,update_catagory


security = HTTPBearer()
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
        
    if isinstance(payload, tuple) and payload[0] == "expired":
        result = payload[1]

        user_id = result.get("user_id")

        if user_id:
            logout_user(user_id)

        raise HTTPException(
            status_code=401,
            detail="Session expired. Please login again."
        )
    return payload

def require_role(*required_role: str):
    def role_checker(data: dict = Depends(get_current_user)):
        if data["role"] not in  required_role:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this resource"
            )

        return data
    return role_checker

app = FastAPI()
@app.get("/dashboard")
def dashboard(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "role": current_user["role"]
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginData):
    result=login_user(data.email,data.password)
    if(result["success"]):
        token = create_access_token({
            "user_id": result["user"]["user_id"],
            "role": result["user"]["role"]
        })
        return {
            "success": True,
            "message": result["message"],
            "access_token": token,
            "token_type": "bearer",
            "user": result["user"]
        }
    raise HTTPException(
        status_code=401,
        detail=result["message"]
    )

@app.post("/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User ID missing from token"
        )
    result = logout_user(user_id)
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )
    return result

@app.get("/admin")
def admin_dashboard(
    data: dict = Depends(require_role("admin","staff"))
):
    return {
        "message": "Welcome to the admin dashboard!",
        "user_id": data["user_id"],
        "role": data["role"]
    }

@app.get("/dashboard/users")
def total_users():
    users = get_total_users()

    return {
        "total_users": users
    }

@app.get('/dashboard/inventory_count')
def inventory_count():
    total=get_inventory_count()
    return {
        'total':total
    }
    
@app.get('/dashboard/requests')
def total_requests():
    total=get_total_requests()
    return {
        'total':total
    }
    
@app.get('/dashboard/loans')
def total_requests():
    total=get_total_requests()
    return {
        'total':total
    }
    
@app.get('/dashboard/history')
def history():
    data=get_history()
    return data

@app.get('/dashboard/inventory')
def inventory():
    data=get_all_items()
    return data

@app.get('/dashboard/get_users')
def users():
    users=get_users()
    return users

class userCreate(BaseModel):
    user_name:str
    email:str
    password:str
    role: Literal["student", "staff", "admin"]

@app.post("/dashboard/add_user")
def new_user(data:userCreate,current_user:dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    result=insert_user(data.user_name,data.email,data.password,data.role)
    return result

@app.get("/dashboard/get_requests")
def fetch_requests():
    result=get_requests()
    return result

class IssueLoan(BaseModel):
    request_id: int
    item_id:int
    due_date: date
@app.post('/loans/issue')
def add_loan(data: IssueLoan,current_user: dict = Depends(get_current_user)):
    result=issue_item(data.request_id,data.item_id,current_user["user_id"],data.due_date)
    return result

@app.get('/loan/get')
def fetch_loan(request_id):
    result=loan_update(request_id)
    return result

@app.get('/loans/show')
def loan_history():
    result=get_loan_history()
    return result

@app.get('/history')
def activity():
    result=get_history()
    return result


class itemData(BaseModel):
    catagory:int
    item_name:str
    item_description:str
    item_condition:Literal["good", "fair", "damaged"]
   
@app.post('/inventory/add_item')
def new_item(data:itemData,current_user:dict = Depends(get_current_user)):
    if current_user["role"] == "student":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    result=add_item(data.catagory,data.item_name,data.item_description,data.item_condition,current_user["user_id"])
    if not result["success"]:
        raise HTTPException (
            status_code=400,
            detail=result["message"]
        )
    return result
    
@app.get('/catagory/get')
def get_catagories():
    result = get_all_catagories()
    return result

@app.get("/reports/loan-history")
def loan_history_report(current_user: dict = Depends(get_current_user)):
    result = get_loan_history()
    return result

class Details_format(BaseModel):
    user_id:int
    user_name:str
    email:str
    role:str
    change:bool
@app.post('/user/update')
def update_details(data:Details_format,current_user:dict=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    result=update_user(data.user_id,data.user_name,data.email,data.role,data.change)
    if not result["success"]:
        raise HTTPException (
            status_code=400,
            detail=result["message"]
        )
    return result

@app.get('/home/userRequests')
def total_requests(current_user:dict=Depends(get_current_user)):
    total=get_user_request_count(current_user['user_id'])
    return {
        'total':total
        }

@app.get('/home/userLoans')
def total_requests(current_user:dict=Depends(get_current_user)):
    total=get_user_loan_count(current_user['user_id'])
    return {
        'total':total
        }
    
@app.get('/home/userLoaninfo')
def total_requests(current_user:dict=Depends(get_current_user)):
    result=get_user_loan(current_user['user_id'])
    return result

@app.get('/home/ReturnedLoaninfo')
def total_requests(current_user:dict=Depends(get_current_user)):
    result=get_returned_loan_count(current_user['user_id'])
    return result

class item_format(BaseModel):
    catagory:int
    item_id:int
    item_name:str
    item_description:str
    item_condition:str
    availability:str
@app.post('/item/update')
def update_details(data:item_format,current_user:dict=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )
    result=update_item(data.catagory,data.item_name,data.item_description,data.item_condition,data.availability,data.item_id)
    if not result["success"]:
        raise HTTPException (
            status_code=400,
            detail=result["message"]
        )
    return result

@app.get('/home/userRequestinfo')
def total_requests(current_user:dict=Depends(get_current_user)):
    result=get_user_requests(current_user['user_id'])
    return result

class requestCreate(BaseModel):
    item_id:int
@app.post('/requests/create')
def new_request(data:requestCreate,current_user:dict=Depends(get_current_user)):
    result=create_borrow_request(current_user['user_id'],data.item_id)
    return result

class requestApprove(BaseModel):
    item_id:int
    request_id:int
@app.post('/requests/approve')
def new_request(data:requestApprove,current_user:dict=Depends(get_current_user)):
    result=approve_request(data.request_id,data.item_id,current_user['user_id'])
    return result

@app.post('/requests/reject')
def new_request(data:requestApprove,current_user:dict=Depends(get_current_user)):
    result=reject_request(data.request_id,data.item_id,current_user['user_id'])
    return result


class CancelRequest(BaseModel):
    request_id: int
@app.post('/requests/cancel')
def cancel_user_request(data: CancelRequest,current_user: dict = Depends(get_current_user)):
    result = cancel_request(data.request_id,current_user['user_id'])
    return result

class ReturnItem(BaseModel):
    loan_id: int
    item_id:int
    return_condition: str
    notes: str = ""
@app.post('/loans/return')
def return_loan(data: ReturnItem,current_user: dict = Depends(get_current_user)):
    result = return_item(current_user['user_id'],data.item_id,data.return_condition,data.notes,data.loan_id)
    return result

class NewCatagory(BaseModel):
    c_name:str
    c_description:str
@app.post('/catagory/add')
def new_catagory(data:NewCatagory):
    result=add_catagory(data.c_name,data.c_description)
    return result

class UpdateCatagory(BaseModel):
    c_id:int
    c_name:str
    c_description:str
@app.post('/catagory/update')
def change_catagory(data:UpdateCatagory):
    result=update_catagory(data.c_id,data.c_name,data.c_description)
    return result

