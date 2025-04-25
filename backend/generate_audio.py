import sys
from TTS.api import TTS

# Load the model (can be cached)
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False, gpu=False)

# Get text and output path from command-line args
text = sys.argv[1]
output_path = sys.argv[2]

# Generate the audio file
tts.tts_to_file(text=text, file_path=output_path)
