import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

const spec = require('./openapi-proposal.yaml');

const ui = SwaggerUI({
  spec,
  dom_id: '#spec',
});

