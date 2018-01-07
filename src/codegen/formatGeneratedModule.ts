import { FormatModule } from 'relay-compiler/lib/writeRelayGeneratedFile';

export const formatGeneratedModule: FormatModule = (opts) => {
	const {
		moduleName,
		documentType,
		docText,
		concreteText,
		flowText,
		hash,
		relayRuntimeModule,
		sourceHash,
	  } = opts;
	const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
	const hashText = hash ? `\n * ${hash}` : '';
	return `/**${hashText}
 */

/* tslint:disable */

import { ${documentType} } from '${relayRuntimeModule}';
${flowText || ''}

${docTextComment}
const node: ${documentType} = ${concreteText};
(node as any).hash = '${sourceHash}';
export default node;
`;
};
