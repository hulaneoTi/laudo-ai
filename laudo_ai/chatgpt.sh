#!/bin/bash

audio=$(curl -s https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@./uploads/audio.wav" \
  -F model="whisper-1" | jq -r .text)

while [ -z "$audio" ]; do
  sleep 0.5
done

modelo=$(<modelos/"$1")
modelo=$(echo "$modelo" | tr '\n' ' ')

info="Entenda que no modelo a seguir há 3 áreas: TÉCNICA, COMENTÁRIOS e IMPRESSÃO. A área TÉCNICA só deve ser alterada quando eu informar. Na área COMENTÁRIOS você deve análisar detalhadamente o que está escrito e comparar com a informação fornecida, essa informação deve complementar o texto (por exemplo, se a informação conter algo relacionado ao coração ela deve ser apresentada no parágrafo correspondente no modelo), se encontrar informações antagônicas elas devem ser substituidas conforme as informações fornecidas, as informações fornecidas devem aparecer nessa área (menos se ela for relacionada a técnica). O texto do modelo não pode ser apagado, somente substituido caso seja necessário. A área IMPRESSÃO você deve resumir de forma concisa, evitando o uso de medidas, ou descrição de estruturas sem alterações. Utilize o seguinte modelo (que está entre chaves, porém sua resposta não deve conter essas chaves) { ${modelo} } para criar um texto com a mesma formatação com as seguintes informações: $audio. Sua resposta deve manter a formatação do modelo utilizando essas três áreas"

curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d "{
    \"model\": \"gpt-3.5-turbo-16k-0613\",
    \"messages\": [{\"role\": \"system\", \"content\": \"$info\"}]
  }" | jq -r .choices[].message.content