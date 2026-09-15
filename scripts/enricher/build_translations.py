import json
import os
import time
import re
from deep_translator import MyMemoryTranslator

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QUESTIONS_PATH = os.path.join(ROOT_DIR, 'src/data/question_bank/questions.json')
CACHE_PATH = os.path.join(ROOT_DIR, 'scripts/enricher/translation_cache.json')

def has_chinese(text):
    return bool(text and re.search(r'[\u4e00-\u9fa5]', text))

def main():
    print("=== TRANSLATING CHINESE STRINGS TO VIETNAMESE ===")
    with open(QUESTIONS_PATH, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Load existing cache
    cache = {}
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, 'r', encoding='utf-8') as f:
            cache = json.load(f)
    print(f"Loaded {len(cache)} existing cached translations.")

    # Collect unique strings that need translation
    to_translate = set()
    for q in questions:
        if has_chinese(q.get('questionType')):
            to_translate.add(q['questionType'])
        if has_chinese(q.get('evidenceLocation')):
            to_translate.add(q['evidenceLocation'])
        if q.get('choiceNotes'):
            for n in q['choiceNotes']:
                if has_chinese(n):
                    to_translate.add(n)
        if q.get('tags'):
            for t in q['tags']:
                if has_chinese(t):
                    to_translate.add(t)

    needed = [s for s in to_translate if s not in cache]
    print(f"Total unique strings with Chinese: {len(to_translate)}. Needed to translate: {len(needed)}")

    if needed:
        translator = MyMemoryTranslator(source='zh-TW', target='vi-VN')
        count = 0
        for s in needed:
            try:
                res = translator.translate(s)
                # Cleanup common formatting artifacts if any
                res = res.strip()
                cache[s] = res
                count += 1
                if count % 20 == 0:
                    print(f"  Translated {count}/{len(needed)}...")
                    with open(CACHE_PATH, 'w', encoding='utf-8') as f:
                        json.dump(cache, f, ensure_ascii=False, indent=2)
                time.sleep(0.08)
            except Exception as e:
                print(f"  Error on '{s}': {e}")
                time.sleep(0.5)

        with open(CACHE_PATH, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print(f"Completed! Translated {count} items.")

if __name__ == '__main__':
    main()
