curl -X GET \
  https://brain.jekjob.com/api/v1/documents/ \
  -H "accept: application/json" \
  -H "Authorization: Bearer $(cat token.txt)"
