import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from datetime import datetime

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

def main():
    """Main function to test the coach finder with test values."""
    
    # Test with Sporting Kansas, graduation year 2025
    team_name = "Sporting Kansas"
    grad_year = 2025
    
    print(f"Searching for coach contact information for {team_name} (Graduation Year: {grad_year})...")
    print("-" * 60)
    
    result = find_coach_by_graduation_year(team_name, grad_year)
    print("\nResult:")
    print(result)

if __name__ == "__main__":
    main() 