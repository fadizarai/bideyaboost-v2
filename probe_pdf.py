import pdfplumber
import sys
import json

def probe_pdf(filepath):
    try:
        results = []
        with pdfplumber.open(filepath) as pdf:
            results.append({"total_pages": len(pdf.pages)})
            for i in range(15, min(30, len(pdf.pages))):
                page = pdf.pages[i]
                tables = page.extract_tables()
                if tables:
                    table_data = {"page": i+1, "rows": []}
                    for row in tables[0][:5]:
                        table_data["rows"].append(row)
                    results.append(table_data)
                    break
        with open("probe_output.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    probe_pdf(r"c:\Users\Fedy Zarai\Desktop\bideyaboost-v2\SD_TN_2025.pdf")
