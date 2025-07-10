import time
import sys
import argparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import json
import gender_guesser.detector as gender_detector

def get_players_by_state(state, gender=None, position=None):
    """
    Scrape players from TopDrawerSoccer filtered by the specified state and gender.
    
    Args:
        state (str): The state to filter by (e.g., "Pennsylvania", "California", "Texas")
        gender (str, optional): Gender filter - "Male", "Female", or None for both
        position (str, optional): Position filter - "Goalkeeper", "Defender", "Midfielder", "Forward", "GK", "D", "M", "F", or None for all
    
    Returns:
        list: List of player dictionaries
    """
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # ENABLED for headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize the driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    # Execute script to remove webdriver property
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Try to close consent/cookie popups if present
    try:
        time.sleep(2)  # Wait for popup to appear
        consent_buttons = driver.find_elements(By.XPATH, "//button[contains(translate(., 'ACEPT', 'acept'), 'accept') or contains(translate(., 'AGREE', 'agree'), 'agree') or contains(., 'I Agree') or contains(., 'Accept') or contains(., 'Got it') or contains(., 'OK')]")
        for btn in consent_buttons:
            if btn.is_displayed() and btn.is_enabled():
                print("Clicking consent/cookie popup button...")
                btn.click()
                time.sleep(2)
                break
    except Exception as e:
        print(f"Consent popup not found or could not be closed: {e}")
    
    players = []
    
    try:
        print(f"1. Navigating to TopDrawerSoccer...")
        driver.get("https://www.topdrawersoccer.com/search/?area=clubplayer")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 15)
        
        print("2. Waiting for page to fully load...")
        time.sleep(3)
        
        print("3. Looking for the search form...")
        # Wait for the form to be present
        form = wait.until(
            EC.presence_of_element_located((By.ID, "formFilters"))
        )
        print("Found search form")
        
        print(f"4. Looking for state dropdown...")
        # Find the state dropdown
        state_label = driver.find_element(By.XPATH, "//label[contains(text(), 'State:')]")
        print("Found State label")
        
        # Get the select element that follows the State label
        state_select = state_label.find_element(By.XPATH, "following-sibling::select")
        print("Found state select element")
        
        # Make sure the element is visible and interactable
        driver.execute_script("arguments[0].scrollIntoView(true);", state_select)
        time.sleep(1)
        
        print(f"5. Selecting {state} using JavaScript...")
        # Use JavaScript to select the specified state
        driver.execute_script("""
            var select = arguments[0];
            var targetState = arguments[1];
            for(var i = 0; i < select.options.length; i++) {
                if(select.options[i].text === targetState) {
                    select.selectedIndex = i;
                    select.dispatchEvent(new Event('change'));
                    break;
                }
            }
        """, state_select, state)
        print(f"Selected {state}")
        
        # Add gender filtering if specified
        if gender:
            print(f"5.5. Looking for gender radio inputs...")
            try:
                gender_value = None
                if gender.lower() == "male":
                    gender_value = "1"
                elif gender.lower() == "female":
                    gender_value = "2"
                else:
                    gender_value = ""
                radio = driver.find_element(By.XPATH, f"//input[@name='genderId' and @value='{gender_value}']")
                driver.execute_script("arguments[0].scrollIntoView(true);", radio)
                time.sleep(0.5)
                driver.execute_script("arguments[0].click();", radio)
                print(f"Clicked gender radio for value {gender_value} ({gender})")
                time.sleep(1)
            except Exception as e:
                print(f"Error with gender filtering: {e}")
                import traceback
                traceback.print_exc()
        
        # Add position filtering if specified
        if position and position.lower() != 'all':
            print(f"5.6. Looking for position dropdown...")
            try:
                # Wait for position dropdown to be available
                position_dropdown = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "select[name='positionId']"))
                )
                
                # Scroll to the dropdown
                driver.execute_script("arguments[0].scrollIntoView(true);", position_dropdown)
                time.sleep(1)
                
                # Map position letters to numeric values used by the website
                position_map = {
                    'F': '5',  # Forward
                    'D': '2',  # Defender
                    'MF': '6', # Midfielder
                    'GK': '1'  # Goalkeeper
                }
                
                # Get the numeric value for the position
                position_value = position_map.get(position.upper(), position)
                
                # Select the position using JavaScript
                driver.execute_script(f"arguments[0].value = '{position_value}';", position_dropdown)
                print(f"Selected position: {position} (value: {position_value})")
                
                # Trigger change event
                driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", position_dropdown)
                time.sleep(1)
                
            except Exception as e:
                print(f"Error with position filtering: {e}")
                import traceback
                traceback.print_exc()
        
        # Submit the form after all filters are applied
        if gender or (position and position.lower() != 'all'):
            try:
                form = driver.find_element(By.ID, "formFilters")
                driver.execute_script("arguments[0].submit();", form)
                print("Submitted form after filter selection.")
                # Wait for results to update
                wait = WebDriverWait(driver, 15)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".item, .player-result, .search-result")))
                print("Results updated after filters.")
                # Re-fetch form and pagination elements
                form = driver.find_element(By.ID, "formFilters")
                pagination = driver.find_element(By.CSS_SELECTOR, 'ul.pagination')
                print("Re-fetched form and pagination after filter submission.")
                # Take a screenshot after filters are applied
                screenshot_name = f"after_filters"
                if gender:
                    screenshot_name += f"_{gender.lower()}"
                if position and position.lower() != 'all':
                    screenshot_name += f"_{position.lower()}"
                screenshot_name += ".png"
                driver.save_screenshot(screenshot_name)
                print(f"Screenshot saved: {screenshot_name}")
            except Exception as e:
                print(f"Error submitting form: {e}")
                import traceback
                traceback.print_exc()
        
        print("6. Looking for search button...")
        # Try multiple approaches to find the search button
        search_button = None
        
        # Approach 1: Look for submit button
        try:
            search_button = form.find_element(By.CSS_SELECTOR, "input[type='submit']")
            print("Found submit button")
        except:
            pass
        
        # Approach 2: Look for button with "Search" text
        if not search_button:
            try:
                search_button = form.find_element(By.XPATH, "//input[@value='Search']")
                print("Found Search button by value")
            except:
                pass
        
        # Approach 3: Look for any button in the form
        if not search_button:
            try:
                search_button = form.find_element(By.TAG_NAME, "button")
                print("Found button element")
            except:
                pass
        
        # Approach 4: Look for any input in the form
        if not search_button:
            try:
                search_button = form.find_element(By.TAG_NAME, "input")
                print("Found input element")
            except:
                pass
        
        if not search_button:
            print("Could not find search button, trying form submission...")
            # Try to submit the form directly
            driver.execute_script("arguments[0].submit();", form)
            print("Submitted form using JavaScript")
        else:
            print("7. Clicking search button...")
            # Use JavaScript to click the button
            driver.execute_script("arguments[0].click();", search_button)
            print("Clicked search button")
        
        # Wait for results
        print("8. Waiting for results...")
        time.sleep(5)
        
        # Take screenshot of results page
        screenshot_name = f"{state.lower().replace(' ', '_')}"
        if gender:
            screenshot_name += f"_{gender.lower()}"
        screenshot_name += "_results.png"
        driver.save_screenshot(screenshot_name)

        # Dump pagination HTML for debugging
        try:
            pagination = driver.find_element(By.CSS_SELECTOR, 'ul.pagination')
            driver.execute_script("arguments[0].scrollIntoView(true);", pagination)
            time.sleep(5)  # Wait longer for pagination to render
            pagination_links = driver.find_elements(By.CSS_SELECTOR, "ul.pagination li a.page-link")
            print("All page-link texts and HTML found:")
            for link in pagination_links:
                print(f"  OUTER HTML: {link.get_attribute('outerHTML')}")
                print(f"  TEXT: [{link.text.strip()}]")
            pagination_html = pagination.get_attribute('outerHTML')
            with open('pagination_debug.html', 'w', encoding='utf-8') as f:
                f.write(pagination_html)
            print('Saved pagination HTML to pagination_debug.html')
        except Exception as e:
            print(f'Could not find or save pagination HTML: {e}')
        
        print("9. Starting pagination scraping...")
        total_players = 0
        max_pages = 50  # Safety limit to prevent infinite loops

        # Find the total number of pages from the pagination links
        try:
            pagination_links = driver.find_elements(By.CSS_SELECTOR, "ul.pagination li a.page-link")
            page_numbers = []
            print("All page-link texts found:")
            for link in pagination_links:
                try:
                    num = int(link.text.strip())
                    page_numbers.append(num)
                    print(f' Found page number: {num}')
                except ValueError:
                    continue
            last_page = max(page_numbers) if page_numbers else 1
            print(f"   Detected {last_page} total pages.")
        except Exception as e:
            print(f"   Could not determine total pages: {e}")
            last_page = 1

        for page_num in range(1, last_page + 1):
            print(f"   Scraping page {page_num} of {last_page}...")
            if page_num > 1:
                try:
                    # Scroll to bottom to trigger lazy loading
                    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(1)
                    # Retry up to 3 times to find and click the correct page link or Next
                    page_clicked = False
                    for attempt in range(3):
                        # Re-fetch pagination container and links after each attempt
                        time.sleep(2)
                        pagination = driver.find_element(By.CSS_SELECTOR, 'ul.pagination')
                        pagination_links = pagination.find_elements(By.CSS_SELECTOR, "a.page-link")
                        print(f"Page {page_num} - Attempt {attempt+1} - All page-link texts found:")
                        for link in pagination_links:
                            print(f"  [{link.text.strip()}]")
                        # Try to click the page number link
                        for link in pagination_links:
                            if link.text.strip() == str(page_num):
                                print(f"   Clicking page link for page {page_num}...")
                                driver.execute_script("arguments[0].scrollIntoView(true);", link)
                                time.sleep(0.5)
                                driver.execute_script("arguments[0].click();", link)
                                page_clicked = True
                                break
                        if page_clicked:
                            break
                        # If not found, try Next button
                        for link in pagination_links:
                            if link.text.strip().lower() == "next":
                                print(f"   Clicking Next button...")
                                driver.execute_script("arguments[0].scrollIntoView(true);", link)
                                time.sleep(0.5)
                                driver.execute_script("arguments[0].click();", link)
                                page_clicked = True
                                break
                        if page_clicked:
                            break
                        print(f"   Could not find page link or Next button for page {page_num}, retrying...")
                    if not page_clicked:
                        print(f"   Could not navigate to page {page_num} after retries, skipping...")
                        continue
                    # Wait for the page to actually change by checking for new content
                    print(f"   Waiting for page {page_num} to load...")
                    for wait_count in range(30):
                        try:
                            active_page = driver.find_element(By.CSS_SELECTOR, "ul.pagination li.active span.page-link").text.strip()
                            if active_page == str(page_num):
                                print(f"   ✓ Page {page_num} loaded successfully (active page: {active_page})")
                                break
                            else:
                                print(f"   Waiting... current active page: {active_page}, expecting: {page_num}")
                                time.sleep(0.5)
                        except Exception as e:
                            print(f"   Waiting for active page indicator... ({wait_count + 1}/30)")
                            time.sleep(0.5)
                    else:
                        print(f"   ⚠️ Could not verify page {page_num} loaded, continuing anyway...")
                    # Additional wait for content to load
                    time.sleep(2)
                except Exception as e:
                    print(f"   Could not navigate to page {page_num}: {e}")
                    continue
            # Scroll to bottom again to trigger any lazy loading
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            # Wait for player elements to load
            try:
                wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".item, .player-result, .search-result"))
                )
            except:
                print(f"   ⚠️ No player elements found on page {page_num}")
                continue
            # Re-fetch player elements after each page load
            page_players = extract_players_from_page(driver, state)
            players.extend(page_players)
            print(f"   Found {len(page_players)} players on page {page_num}")
            total_players += len(page_players)
        print(f"10. Successfully extracted {total_players} total players from {state} across {last_page} pages")
        
        # Position filtering is now applied before scraping, so we don't need to filter here
        # The website should already return only players with the specified position
        
        # Simple deduplication
        print(f"Before deduplication: {len(players)} players")
        seen = set()
        unique_players = []
        for player in players:
            key = f"{player.get('name', '').lower().strip()}_{player.get('club', '').lower().strip()}"
            if key not in seen:
                seen.add(key)
                unique_players.append(player)
        players = unique_players
        print(f"After deduplication: {len(players)} players")
        
    except Exception as e:
        print(f"Error during scraping: {str(e)}")
        driver.save_screenshot(f"{state.lower().replace(' ', '_')}_error.png")
        # Save page source for debugging
        with open(f"{state.lower().replace(' ', '_')}_error_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        
    finally:
        driver.quit()
    
    return players

def extract_players_from_page(driver, state):
    """
    Extract players from the current page.
    
    Args:
        driver: Selenium WebDriver instance
        state: Current state being scraped
        
    Returns:
        list: List of player dictionaries from current page
    """
    page_players = []
    
    # Try to find player elements - updated selectors for current TopDrawerSoccer structure
    player_selectors = [
        "table tbody tr",  # Table body rows (most likely)
        ".player-row",
        ".search-result",
        ".item",
        ".result",
        "tr[data-player]",  # Rows with player data attributes
        ".player-item",
        "table tr",  # All table rows (fallback)
    ]
    
    all_players = []
    for selector in player_selectors:
        try:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements and len(elements) > 1:  # More than just header
                print(f"      Found {len(elements)} elements with selector: {selector}")
                # Process ALL elements - no filtering, let the extraction function handle invalid data
                all_players = elements
                print(f"      Processing all {len(all_players)} elements")
                break
        except Exception as e:
            print(f"      Error with selector {selector}: {e}")
            continue
    
    if not all_players:
        print("      No player elements found on this page.")
        # Save page source for debugging
        with open(f'page_source_debug_{state.lower().replace(" ", "_")}.html', 'w', encoding='utf-8') as f:
            f.write(driver.page_source)
        return []
    
    # Extract player information from table structure
    for i, element in enumerate(all_players):
        try:
            # Debug: Print the HTML structure of the first few elements
            if i < 3:
                print(f"      DEBUG - Element {i} HTML:")
                print(f"      {element.get_attribute('outerHTML')}")
                print(f"      Text: '{element.text.strip()}'")
                print(f"      ---")
            
            # Try to extract data from the div structure (TopDrawerSoccer format)
            player_info = extract_player_from_div_structure(element, state)
            if player_info and player_info.get('name') != 'Unknown':
                player_info["player_number"] = len(page_players) + 1
                page_players.append(player_info)
                
                # Debug: Print extracted info for first few players
                if len(page_players) <= 3:
                    print(f"      DEBUG - Player {len(page_players)}:")
                    print(f"      Name: {player_info['name']}")
                    print(f"      Club: {player_info['club']}")
                    print(f"      Position: {player_info['position']}")
                    print(f"      Graduation: {player_info['graduation_year']}")
                    print(f"      Committed: {player_info['committed']}")
                    print(f"      ---")
            else:
                # Fallback to text extraction if div structure extraction fails
                text = element.text.strip()
                if text and len(text) > 10:
                    player_info = extract_player_from_text(text, state)
                    if player_info and player_info.get('name') != 'Unknown':
                        player_info["player_number"] = len(page_players) + 1
                        page_players.append(player_info)
                        
        except Exception as e:
            print(f"      Error processing element {i}: {str(e)}")
            continue
    
    return page_players

def extract_player_from_cells(cells, state):
    """Extract player information from table cells"""
    try:
        # Debug: Print cell contents to understand structure
        print(f"      DEBUG - Found {len(cells)} cells:")
        for j, cell in enumerate(cells):
            print(f"        Cell {j}: '{cell.text.strip()}'")
        
        # Based on typical TopDrawerSoccer table structure:
        # Column 0: Player Name
        # Column 1: Club/Team
        # Column 2: Position
        # Column 3: Graduation Year
        # Column 4: Commitment Status/College
        
        player_info = {
            "name": cells[0].text.strip() if len(cells) > 0 else "Unknown",
            "club": cells[1].text.strip() if len(cells) > 1 else "Unknown",
            "state": state,
            "position": extract_position_from_cell(cells[2].text.strip()) if len(cells) > 2 else "Unknown",
            "graduation_year": extract_graduation_year_from_cell(cells[3].text.strip()) if len(cells) > 3 else "Unknown",
            "committed": extract_commitment_from_cell(cells[4].text.strip()) if len(cells) > 4 else "Not Committed"
        }
        
        return player_info
    except Exception as e:
        print(f"      Error extracting from cells: {e}")
        return None

def extract_player_from_div_structure(element, state):
    """Extract player information from the div structure used by TopDrawerSoccer"""
    try:
        # Extract player name from the <a class="bd"> tag inside .ml-2
        name = "Unknown"
        try:
            ml2 = element.find_element(By.CSS_SELECTOR, ".col-name .ml-2")
            name_a = ml2.find_element(By.CSS_SELECTOR, "a.bd")
            name = name_a.get_attribute("innerText").strip() or name_a.get_attribute("textContent").strip()
            print(f"        [DEBUG] Found name: '{name}'")
        except Exception as e:
            print(f"        [DEBUG] Could not extract player name: {e}")
            # Try alternative approach
            try:
                name_a = element.find_element(By.CSS_SELECTOR, "a.bd")
                name = name_a.get_attribute("innerText").strip() or name_a.get_attribute("textContent").strip()
                print(f"        [DEBUG] Found name with alternative approach: '{name}'")
            except Exception as e2:
                print(f"        [DEBUG] Alternative approach also failed: {e2}")

        # Extract club: the text node after the rating span in .ml-2
        club = "Unknown"
        try:
            # Get all children of ml2
            children = ml2.find_elements(By.XPATH, "./*")
            found_rating = False
            for child in children:
                if found_rating:
                    # The next visible text node after the rating span is the club
                    club_candidate = child.get_attribute("innerText").strip() or child.get_attribute("textContent").strip()
                    if club_candidate and not club_candidate.lower().startswith("state:") and not club_candidate.lower().startswith("pos:"):
                        club = club_candidate
                        break
                if child.get_attribute("class") and "rating-box-blue" in child.get_attribute("class"):
                    found_rating = True
            # Fallback: sometimes the club is a direct text node, not a child
            if club == "Unknown":
                ml2_text = (ml2.get_attribute("innerText") or ml2.get_attribute("textContent") or "").split("\n")
                if len(ml2_text) > 1:
                    for line in ml2_text[1:]:
                        if line.strip() and not line.lower().startswith("state:") and not line.lower().startswith("pos:"):
                            club = line.strip()
                            break
        except Exception as e:
            print(f"        [DEBUG] Could not extract club: {e}")

        # Extract state from col-state div
        player_state = state
        try:
            state_element = element.find_element(By.CSS_SELECTOR, ".col-state")
            player_state = state_element.get_attribute("innerText").strip() or state_element.get_attribute("textContent").strip() or state
        except Exception as e:
            print(f"        [DEBUG] Could not extract state: {e}")

        # Extract position from col-position div
        position = "Unknown"
        try:
            position_element = element.find_element(By.CSS_SELECTOR, ".col-position")
            position = position_element.get_attribute("innerText").strip() or position_element.get_attribute("textContent").strip() or "Unknown"
        except Exception as e:
            print(f"        [DEBUG] Could not extract position: {e}")

        # Extract graduation year from col-grad div
        graduation_year = "Unknown"
        try:
            grad_element = element.find_element(By.CSS_SELECTOR, ".col-grad")
            graduation_year = grad_element.get_attribute("innerText").strip() or grad_element.get_attribute("textContent").strip() or "Unknown"
        except Exception as e:
            print(f"        [DEBUG] Could not extract graduation year: {e}")

        # Extract commitment from the last .d-flex.align-items-center (look for a college name or link)
        committed = "Not Committed"
        try:
            commitment_divs = element.find_elements(By.CSS_SELECTOR, ".d-flex.align-items-center")
            if commitment_divs:
                last_div = commitment_divs[-1]
                # Look for a link (college commitment)
                links = last_div.find_elements(By.TAG_NAME, "a")
                if links:
                    committed = links[0].get_attribute("innerText").strip() or links[0].get_attribute("textContent").strip()
                else:
                    commitment_text = last_div.get_attribute("innerText").strip() or last_div.get_attribute("textContent").strip()
                    if commitment_text and commitment_text != "&nbsp;":
                        committed = commitment_text
        except Exception as e:
            print(f"        [DEBUG] Could not extract commitment: {e}")

        player_info = {
            "name": name,
            "club": club,
            "state": player_state,
            "position": position,
            "graduation_year": graduation_year,
            "committed": committed
        }

        return player_info
    except Exception as e:
        print(f"      Error extracting from div structure: {e}")
        return None

def extract_player_from_text(text, state):
    """Fallback: Extract player information from raw text"""
    lines = text.split('\n')
    
    player_info = {
        "name": "Unknown",
        "club": "Unknown", 
        "state": state,
        "position": "Unknown",
        "graduation_year": "Unknown",
        "committed": "Not Committed"
    }
    
    # Try to extract information from lines
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Extract name (first substantial line that looks like a name)
        if player_info["name"] == "Unknown" and len(line) >= 3 and any(c.isalpha() for c in line):
            player_info["name"] = line
            
        # Extract position
        elif player_info["position"] == "Unknown":
            pos = extract_position_from_cell(line)
            if pos != "Unknown":
                player_info["position"] = pos
                
        # Extract graduation year
        elif player_info["graduation_year"] == "Unknown":
            year = extract_graduation_year_from_cell(line)
            if year != "Unknown":
                player_info["graduation_year"] = year
                
        # Extract commitment
        elif player_info["committed"] == "Not Committed":
            commit = extract_commitment_from_cell(line)
            if commit != "Not Committed":
                player_info["committed"] = commit
    
    return player_info

def extract_position_from_cell(text):
    """Extract position from cell text"""
    positions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "GK", "D", "M", "F"]
    for pos in positions:
        if pos.lower() in text.lower():
            return pos
    return "Unknown"

def extract_graduation_year_from_cell(text):
    """Extract graduation year from cell text"""
    import re
    years = re.findall(r'20[2-3][0-9]', text)
    if years:
        return years[0]
    return "Unknown"

def extract_commitment_from_cell(text):
    """Extract commitment information from cell text"""
    if not text or text.lower() in ['unknown', 'n/a', 'tbd', '']:
        return "Not Committed"
    
    # Look for commitment indicators
    commitment_indicators = [
        "committed",
        "verbal", 
        "signed",
        "nli",
        "national letter of intent"
    ]
    
    text_lower = text.lower()
    for indicator in commitment_indicators:
        if indicator in text_lower:
            return text.strip()  # Return the full commitment text
    
    return "Not Committed"

def filter_players_by_name_gender(players, gender):
    d = gender_detector.Detector(case_sensitive=False)
    filtered = []
    target = gender.lower()
    for player in players:
        first_name = player['name'].split()[0]
        guess = d.get_gender(first_name)
        # gender-guesser returns: 'male', 'female', 'mostly_male', 'mostly_female', 'andy', 'unknown'
        if target == 'female' and guess in ['female', 'mostly_female']:
            filtered.append(player)
        elif target == 'male' and guess in ['male', 'mostly_male']:
            filtered.append(player)
    return filtered

def save_players(players, state, filename=None, gender=None):
    """Save players to JSON file"""
    if filename is None:
        filename = f"{state.lower().replace(' ', '_')}"
        if gender:
            filename += f"_{gender.lower()}"
        filename += "_players.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=2, ensure_ascii=False)
    print(f"Results saved to {filename}")

def main():
    """Main function to handle command line arguments and run the scraper"""
    parser = argparse.ArgumentParser(description='Scrape TopDrawerSoccer players by state with pagination')
    parser.add_argument('state', help='State to filter by (e.g., "Pennsylvania", "California")')
    parser.add_argument('--gender', '-g', choices=['Male', 'Female'], help='Gender filter (Male or Female)')
    parser.add_argument('--position', '-p', help='Position to filter by (optional)')
    parser.add_argument('--output', '-o', help='Output filename (optional)')
    
    args = parser.parse_args()
    
    state = args.state
    gender = args.gender
    position = args.position
    output_file = args.output
    
    print(f"Starting TopDrawerSoccer {state} Player Scraper")
    if gender:
        print(f"Gender filter: {gender}")
    if position:
        print(f"Position filter: {position}")
    print("=" * 60)
    
    players = get_players_by_state(state, gender, position)
    
    if gender:
        print(f"Filtering players by name-based gender: {gender}")
        players = filter_players_by_name_gender(players, gender)
        print(f"After filtering: {len(players)} players remain")
    
    if players:
        save_players(players, state, output_file, gender)
        print(f"\nSuccess! Found {len(players)} players from {state}")
        if gender:
            print(f"Gender: {gender}")
        if position:
            print(f"Position: {position}")
        print("\nFirst 5 players:")
        for i, player in enumerate(players[:5]):
            print(f"{i+1}. {player['name']} - {player['club']} - {player['position']} - {player['graduation_year']} - {player['committed']}")
    else:
        print(f"No players found for {state}. Check the generated screenshots and HTML files for debugging.")

# For backward compatibility
def get_pennsylvania_players():
    """Legacy function for Pennsylvania players"""
    return get_players_by_state("Pennsylvania")

if __name__ == "__main__":
    main() 