import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from datetime import datetime
import json

def grad_year_to_age_group(grad_year: int) -> str:
    current_year = datetime.now().year
    birth_year = grad_year - 18  # Assuming HS graduation at age 18
    age = current_year - birth_year
    return f"U{age}"

# Load environment variables
load_dotenv()

def find_coach_contact(team_name, age_group):
    """
    Find coach contact details for a given team and age group.
    
    Args:
        team_name (str): Name of the club/team (e.g., "Sporting Kansas")
        age_group (str): Age group (e.g., "U18")
    
    Returns:
        str: Coach contact information
    """
    
    # Initialize the language model
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Initialize the search tool
    search_tool = TavilySearch(
        max_results=5,
        api_key=os.getenv("TAVILLY_API_KEY")
    )
    
    # Create the system prompt
    system_prompt = """You are a helpful assistant that finds coach contact information for soccer teams.
    
    When given a team name and age group, you should:
    1. Search for the team's official website or social media
    2. Look for coaching staff information
    3. Find contact details (email, phone, social media) for the coach
    4. Provide the coach's name and contact information in a clear format
    
    Be thorough in your search and provide accurate, up-to-date information."""
    
    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_prompt),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    # Create the agent
    agent = create_openai_functions_agent(llm, [search_tool], prompt)
    agent_executor = AgentExecutor(agent=agent, tools=[search_tool], verbose=False)
    
    # Create the query
    query = f"Find the coach contact information for {team_name} {age_group} team. I need the coach's name, email, and phone number if available."
    
    # Execute the search
    result = agent_executor.invoke({"input": query})
    
    return result["output"]

def find_coach_by_graduation_year(team_name: str, grad_year: int):
    """
    Find coach contact details for a team based on graduation year.
    
    Args:
        team_name (str): Name of the club/team (e.g., "Sporting Kansas")
        grad_year (int): Graduation year (e.g., 2025)
    
    Returns:
        str: Coach contact information
    """
    age_group = grad_year_to_age_group(grad_year)
    
    try:
        result = find_coach_contact(team_name, age_group)
        return result
    except Exception as e:
        return f"Error: {e}"

def find_coaches_for_all_players(json_path, output_path, limit=None):
    """
    For each player in the JSON file, find the coach info and save results to output_path.
    Resumes from where it left off if output_path exists.
    Args:
        json_path (str): Path to the player JSON file.
        output_path (str): Path to save the results.
        limit (int, optional): Max number of players to process (for testing).
    """
    import os
    # Load all players
    with open(json_path, 'r') as f:
        players = json.load(f)
    # Load already processed results if output_path exists
    results = []
    processed_set = set()
    if os.path.exists(output_path):
        with open(output_path, 'r') as f:
            try:
                results = json.load(f)
                for r in results:
                    # Use (name, club, grad_year) as unique key
                    processed_set.add((r.get('name'), r.get('club'), r.get('grad_year')))
            except Exception:
                results = []
                processed_set = set()
    count = len(results)
    print(f"Resuming from player {count+1} (already processed {count})")
    for player in players:
        key = (player.get('name'), player.get('club'), player.get('grad_year'))
        if key in processed_set:
            continue
        if limit and count >= limit:
            break
        club = player.get('club')
        grad_year = player.get('grad_year')
        name = player.get('name')
        if not club or not grad_year:
            continue
        try:
            grad_year_int = int(grad_year)
        except Exception:
            continue
        print(f"[{count+1}] Finding coach for {name} | Club: {club} | Grad Year: {grad_year}")
        coach_info = find_coach_by_graduation_year(club, grad_year_int)
        results.append({
            "name": name,
            "club": club,
            "grad_year": grad_year,
            "coach_info": coach_info
        })
        count += 1
        # Optional: Save progress every 10
        if count % 10 == 0:
            with open(output_path, 'w') as f:
                json.dump(results, f, indent=2)
    # Final save
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Saved {len(results)} player-coach mappings to {output_path}")

if __name__ == "__main__":
    # Batch process all players (no limit)
    find_coaches_for_all_players(
        json_path="male_club_players.json",
        output_path="coaches_for_players.json",
        limit=None  # No limit, process all
    ) 