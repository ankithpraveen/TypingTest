from flask import Flask, render_template, jsonify, request
from essential_generators import DocumentGenerator

app = Flask(__name__)

# Initialize the document generator
doc_generator = DocumentGenerator()

def is_simple_english(word):
    # A simple check for English words (modify as needed)
    return all(char.isalpha() and ord(char) < 128 for char in word)

def process_paragraphs(paragraphs, include_special, include_numbers, include_capital):
    processed_paragraphs = []

    for paragraph in paragraphs:
        processed_paragraph = paragraph

        if include_special.lower() == 'false':
            processed_paragraph = ''.join(e for e in processed_paragraph if e.isalnum() or e.isspace())

        if include_numbers.lower() == 'false':
            processed_paragraph = ''.join(e for e in processed_paragraph if not e.isdigit())

        if include_capital.lower() == 'false':
            processed_paragraph = processed_paragraph.lower()

        # Filter out words that are not simple English
        processed_paragraph = ' '.join(word if is_simple_english(word) else '' for word in processed_paragraph.split())

        processed_paragraphs.append(processed_paragraph)

    return processed_paragraphs

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_random_paragraphs')
def get_random_paragraphs():
    include_special = request.args.get('include_special', default='false', type=str)
    include_numbers = request.args.get('include_numbers', default='false', type=str)
    include_capital = request.args.get('include_capital', default='false', type=str)

    try:
        # Generate random sentences using essential_generators
        sentences = [doc_generator.sentence() for _ in range(3)]  # Display 3 sentences

        # Combine sentences to form a paragraph
        paragraph = ' '.join(sentences)

        processed_paragraphs = process_paragraphs([paragraph], include_special, include_numbers, include_capital)
        return jsonify({"paragraph": processed_paragraphs[0]})
    except Exception as e:
        print(f"Error generating random paragraph: {e}")
        return jsonify({"error": "Failed to generate random paragraph"})

if __name__ == '__main__':
    app.run(debug=True)
