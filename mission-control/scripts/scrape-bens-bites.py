#!/usr/bin/env python3
"""
Ben's Bites Newsletter Scraper
Uses Browser Use to scrape newsletter when Gmail API fails
"""

import asyncio
import os
import json
import sys
from datetime import datetime
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "python"))

# Browser Use imports
from browser_use import Agent, ChatBrowserUse

# Configuration
BENS_BITES_URL = "https://www.bensbites.com"  # Fallback to main site
NEWSLETTER_ARCHIVE = "https://bensbites.beehiiv.com/"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "newsletters"

# API Key from environment
API_KEY = os.environ.get('BROWSER_USE_API_KEY')
if not API_KEY:
    print("❌ Error: BROWSER_USE_API_KEY environment variable not set")
    sys.exit(1)

os.environ['BROWSER_USE_API_KEY'] = API_KEY


class BensBitesScraper:
    """Scraper for Ben's Bites AI newsletter"""
    
    def __init__(self):
        self.llm = ChatBrowserUse()
        self.output_dir = OUTPUT_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_latest_newsletter(self) -> dict:
        """Find and extract the latest newsletter content"""
        
        print("🔍 Finding latest Ben's Bites newsletter...")
        
        agent = Agent(
            task=f"""Go to {BENS_BITES_URL} and find the latest newsletter issue.
            
Steps:
1. Navigate to the main page
2. Look for the most recent newsletter link (usually dated)
3. Click on it to open the full newsletter
4. Extract: date, title, and all mentioned AI tools/products

Return ONLY a JSON object with this structure:
{{
    "date": "YYYY-MM-DD",
    "title": "Newsletter title",
    "url": "Direct URL to the newsletter",
    "tools": [
        {{
            "name": "Tool name",
            "description": "Brief description",
            "url": "Tool URL if available"
        }}
    ],
    "summary": "2-3 sentence summary of the main theme"
}}
""",
            llm=self.llm,
        )
        
        result = await agent.run()
        
        # Try to parse JSON from result
        try:
            # AgentHistoryList has .history() method or we can parse from final output
            # The final output is typically in the last history item
            output = str(result)
            
            # Try to find JSON in the output
            json_start = output.find('{')
            json_end = output.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = output[json_start:json_end]
                data = json.loads(json_str)
                return data
            else:
                # Return raw text if no JSON found
                return {
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "title": "Ben's Bites Newsletter",
                    "url": BENS_BITES_URL,
                    "tools": [],
                    "summary": output[:500],
                    "raw_output": output
                }
                
        except json.JSONDecodeError as e:
            print(f"⚠️  Could not parse JSON: {e}")
            return {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "title": "Ben's Bites Newsletter",
                "url": BENS_BITES_URL,
                "tools": [],
                "summary": "Failed to parse structured data",
                "raw_output": str(result)[:1000]
            }
    
    async def extract_tools_detailed(self, newsletter_url: str) -> list:
        """Extract detailed information about all tools mentioned"""
        
        print(f"🔍 Extracting tools from {newsletter_url}...")
        
        agent = Agent(
            task=f"""Go to {newsletter_url} and extract ALL AI tools/products mentioned.

For each tool, extract:
- Name of the tool/product
- One-sentence description
- Link/URL if available
- Category (e.g., "AI Agents", "Coding", "Image Generation", "Productivity")

Return as a JSON array:
[
    {{
        "name": "Tool Name",
        "description": "What it does",
        "url": "https://...",
        "category": "Category"
    }}
]

Be thorough — scan the entire newsletter for every mentioned tool.""",
            llm=self.llm,
            max_steps=25,
        )
        
        result = await agent.run()
        
        try:
            output = str(result)
            json_start = output.find('[')
            json_end = output.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                return json.loads(output[json_start:json_end])
            else:
                return []
                
        except Exception:
            return []
    
    def categorize_tool(self, tool: dict) -> str:
        """Categorize tool by priority for our stack"""
        
        name = tool.get('name', '').lower()
        desc = tool.get('description', '').lower()
        category = tool.get('category', '').lower()
        
        # HIGH priority for our 1-person unicorn mission
        high_keywords = [
            'agent', 'automation', 'workflow', 'cron', 'scheduler',
            'cost', 'cheap', 'free', 'local', 'budget',
            'llm', 'model', 'inference', 'open source',
            'coding', 'developer', 'github', 'git',
            'browser', 'scraping', 'automation'
        ]
        
        medium_keywords = [
            'productivity', 'writing', 'content', 'marketing',
            'analytics', 'data', 'research',
            'integration', 'api', 'webhook'
        ]
        
        text = f"{name} {desc} {category}"
        
        if any(kw in text for kw in high_keywords):
            return "HIGH"
        elif any(kw in text for kw in medium_keywords):
            return "MEDIUM"
        else:
            return "LOW"
    
    async def scrape_and_save(self) -> dict:
        """Full scraping pipeline"""
        
        print("=" * 60)
        print("🗞️  Ben's Bites Newsletter Scraper")
        print("=" * 60)
        print()
        
        # Get latest newsletter
        newsletter = await self.get_latest_newsletter()
        
        print(f"\n📰 Found Newsletter:")
        print(f"   Title: {newsletter.get('title', 'N/A')}")
        print(f"   Date: {newsletter.get('date', 'N/A')}")
        print(f"   URL: {newsletter.get('url', 'N/A')}")
        
        # Extract detailed tools list
        tools = await self.extract_tools_detailed(newsletter.get('url', BENS_BITES_URL))
        newsletter['tools'] = tools
        
        # Categorize tools
        categorized = {"HIGH": [], "MEDIUM": [], "LOW": []}
        for tool in tools:
            priority = self.categorize_tool(tool)
            categorized[priority].append(tool)
        
        newsletter['categorized_tools'] = categorized
        
        # Save to file
        date_str = newsletter.get('date', datetime.now().strftime('%Y-%m-%d'))
        filename = self.output_dir / f"bens-bites-{date_str}.json"
        
        with open(filename, 'w') as f:
            json.dump(newsletter, f, indent=2)
        
        print(f"\n💾 Saved to: {filename}")
        
        # Print summary
        print(f"\n📊 Summary:")
        print(f"   Total tools found: {len(tools)}")
        print(f"   🔴 HIGH priority: {len(categorized['HIGH'])} (implement these)")
        print(f"   🟡 MEDIUM priority: {len(categorized['MEDIUM'])} (consider these)")
        print(f"   🟢 LOW priority: {len(categorized['LOW'])} (skip for now)")
        
        if categorized['HIGH']:
            print(f"\n🔴 HIGH Priority Tools:")
            for tool in categorized['HIGH'][:5]:  # Show top 5
                print(f"   • {tool.get('name')} - {tool.get('description', 'No description')[:60]}...")
        
        print()
        print("=" * 60)
        
        return newsletter


async def main():
    """Main entry point"""
    scraper = BensBitesScraper()
    
    try:
        result = await scraper.scrape_and_save()
        
        # Output JSON for further processing
        print("\n📤 JSON_OUTPUT_START")
        print(json.dumps(result, indent=2))
        print("📤 JSON_OUTPUT_END")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
