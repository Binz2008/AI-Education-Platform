import os

import yaml
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/", response_model=list[dict])
async def get_available_agents():
    """Get list of available AI agents."""
    agents = []

    agents_dir = os.path.join(os.path.dirname(__file__), "..", "..", "agents")

    for agent_file in ["arabic.yaml", "english.yaml", "islamic.yaml"]:
        agent_path = os.path.join(agents_dir, agent_file)

        try:
            with open(agent_path, encoding="utf-8") as f:
                agent_config = yaml.safe_load(f)

            agents.append(
                {
                    "id": agent_file.replace(".yaml", ""),
                    "name": agent_config.get("name", "Unknown"),
                    "subject": agent_config.get("subject", "unknown"),
                    "style": agent_config.get("style", "neutral"),
                    "voice": agent_config.get("voice", "default"),
                    "avatar": agent_config.get("avatar", "/avatars/default.png"),
                    "language": agent_config.get("language", "ar"),
                    "focusAreas": agent_config.get("focusAreas", []),
                }
            )
        except Exception as e:
            # Log error but continue with other agents
            print(f"Error loading agent {agent_file}: {e}")
            continue

    return agents


@router.get("/{agent_id}", response_model=dict)
async def get_agent_details(agent_id: str):
    """Get detailed configuration for specific agent."""
    agent_file = f"{agent_id}.yaml"
    agents_dir = os.path.join(os.path.dirname(__file__), "..", "..", "agents")
    agent_path = os.path.join(agents_dir, agent_file)

    if not os.path.exists(agent_path):
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        with open(agent_path, encoding="utf-8") as f:
            agent_config = yaml.safe_load(f)

        return {
            "id": agent_id,
            "name": agent_config.get("name", "Unknown"),
            "subject": agent_config.get("subject", "unknown"),
            "style": agent_config.get("style", "neutral"),
            "voice": agent_config.get("voice", "default"),
            "avatar": agent_config.get("avatar", "/avatars/default.png"),
            "language": agent_config.get("language", "ar"),
            "rules": agent_config.get("rules", []),
            "contentGuardrails": agent_config.get("contentGuardrails", []),
            "focusAreas": agent_config.get("focusAreas", []),
            "examples": agent_config.get("examples", []),
            "systemPrompt": agent_config.get("systemPrompt", ""),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading agent configuration: {str(e)}")


@router.post("/{agent_id}/chat")
async def chat_with_agent(agent_id: str, message_data: dict):
    """Send message to AI agent and get response."""
    # Get agent configuration
    agent_details = await get_agent_details(agent_id)

    # For now, return a simple response based on agent
    # This will be replaced with actual AI integration

    user_message = message_data.get("content", "")
    child_name = message_data.get("childName", "يا بني")

    if agent_id == "arabic":
        response = f"أهلاً وسهلاً {child_name}! أنا الأستاذ فصيح وأحب أن أساعدك في تعلم اللغة العربية. شكراً لك على رسالتك: '{user_message}'. هل تريد أن نتعلم حروفاً جديدة معاً؟"
    elif agent_id == "english":
        response = f"Hello there {child_name}! I'm Miss Emily and I'm excited to help you learn English! You said: '{user_message}'. That's wonderful! Should we learn some new words together?"
    elif agent_id == "islamic":
        response = f"السلام عليكم {child_name}! أنا الشيخ نور وأحب أن أعلمك عن ديننا الجميل. رسالتك: '{user_message}' جميلة جداً. هل تريد أن نتعلم عن الصدق والأمانة؟"
    else:
        response = f"Hello! I received your message: '{user_message}'. How can I help you learn today?"

    return {
        "agentId": agent_id,
        "agentName": agent_details["name"],
        "response": response,
        "contentType": "text",
        "suggestions": ["احكي لي عن الحروف", "أريد أن أتعلم كلمات جديدة", "هل يمكنك مساعدتي؟"],
    }
