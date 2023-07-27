
# How to run

## With Docker

```bash
docker-compose -f .\docker-compose.yml up -d
```
## Without

1. Install rabbitmq on your pc and run it.
2. `cd app`
3. `npm install`
4. `npm start`
5. `cd worker`
6. `npm install`
7. `npm start`

# Usage

POST on, and as in put some text in cyrillic kazakh, and result will be transliterated text.

http://localhost:3000/process?input=айдаһар


### Result

```json
{
	"result": "aidahar"
}
```