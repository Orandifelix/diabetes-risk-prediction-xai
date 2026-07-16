# app/api/app/api/chat.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.dida import dida_service
from app.dependencies import get_optional_user
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Dida Chat"])


class ChatRequest(BaseModel):
    message: str
    history: list = []
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
   response: str
   history: list
#    prediction_ready: bool = False
#    prediction_data: Optional[dict] = None
#    quick_reply_field: Optional[str] = None
#    is_numeric_field: bool = False




@router.post("", response_model=ChatResponse)
async def chat_with_dida(
    request: ChatRequest,
    current_user: User | None = Depends(get_optional_user),
):
    user_context = None
    if current_user:
        user_context = {
            "name": current_user.name,
            "email": current_user.email,
        }

    result = await dida_service.chat(
        message=request.message,
        history=request.history,
        user_context=user_context,
    )

    return ChatResponse(**result)


@router.get("/intro")
async def get_intro():
    """Get Dida's intro message."""
    return {
        "message": (
            "👋 Hi! I'm **Dida**, your personal diabetes risk assistant.\n\n"
            "I can help you:\n"
            "- 🔍 **Check your diabetes risk** in seconds\n"
            "- 📚 **Learn about diabetes** and prevention\n"
            "- 💡 **Understand your results** with plain English explanations\n"
            "- 🏥 **Get personalised recommendations**\n\n"
            "What would you like to do today?"
        )
    }