import {Store, Action} from 'redux';

import {GlobalState} from 'mattermost-redux/types/store';

import manifest from './manifest';

// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

type Config = {
    numlines_error_truncate: number;
    numlines_warning_truncate: number;
}

const configRoute = `/plugins/${manifest.id}/config`;

const truncate = (args: any[], numLines: number, log: any) => {
    const newArgs = args.map(a => {
        if (typeof a !== 'string') {
            return a;
        }
        return a.split('\n').slice(0, Math.min(a.length, numLines)).join('\n');
    });
    log(...newArgs);
}

export default class Plugin {
    logError = window.console.error;
    logWarn = window.console.warn;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        const config: Config = await fetch(configRoute).then((r) => r.json());

        const numError = config.numlines_error_truncate;
        if (numError) {
            window.console.error = (...args: any[]) => truncate(args, numError, this.logError);
        }

        const numWarn = config.numlines_warning_truncate;
        if (numWarn) {
            window.console.warn = (...args: any[]) => truncate(args, numWarn, this.logWarn);
        }
    }

    public uninitialize() {
        window.console.error = this.logError;
        window.console.warn = this.logWarn;
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
