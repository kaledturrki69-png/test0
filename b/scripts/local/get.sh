curl -X GET \
  http://localhost:8001/api/v1/documents/ \
  -H "accept: application/json" \
  -H "Authorization: Bearer $(cat token.txt)"
