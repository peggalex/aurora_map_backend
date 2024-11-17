export function logTimeSync<TReturn>(
	params: {
		callback: () => TReturn extends Promise<any> ? never : TReturn;
		taskName: string;
		context: Record<string, any>;
	},
	indentLevel = 0
) {
	const logTime = (msg: string) =>
		console.log(
			`${Array(indentLevel)
				.fill("\t")
				.join("")}\t[${new Date().toLocaleTimeString()}] ${msg}`
		);

	logTime(
		`starting task: ${params.taskName} | ${JSON.stringify(params.context)}`
	);
	const startTime = new Date();
	const ret = params.callback();
	const endTime = new Date();
	logTime(
		`ended task: ${params.taskName} | time elapsed: ${
			endTime.valueOf() - startTime.valueOf()
		}ms\n`
	);
	return ret;
}

export async function logTime<TReturn>(
	params: {
		callback: () => Promise<TReturn>;
		taskName: string;
		context: Record<string, any>;
	},
	indentLevel = 0
) {
	const logTime = (msg: string) =>
		console.log(
			`${Array(indentLevel)
				.fill("\t")
				.join("")}\t[${new Date().toLocaleTimeString()}] ${msg}`
		);

	logTime(
		`starting task: ${params.taskName} | ${JSON.stringify(params.context)}`
	);
	const startTime = new Date();
	const ret = await params.callback();
	const endTime = new Date();
	logTime(
		`ended task: ${params.taskName} | time elapsed: ${
			endTime.valueOf() - startTime.valueOf()
		}ms\n`
	);
	return ret;
}
