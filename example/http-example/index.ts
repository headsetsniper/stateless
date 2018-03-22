import { HttpRequest } from './http-request';

(async () => {
  const httpRequest = new HttpRequest('http://www.google.com');
  const result = await httpRequest.send();
  console.log(`Final result: ${result}`);
  console.log(httpRequest.toDotGraph());
})();
