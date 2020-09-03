import ScatterJS from '@scatterjs/core'
import ScatterEOS from '@scatterjs/eosjs2'
import {
    Authenticator, ButtonStyle, Chain,
    UALError, UALErrorType, User
} from 'universal-authenticator-library'
import {StarteosIcon} from './StarteosIcon'
import {StarteosUser} from './StarteosUser'
import {UALStarteosError} from './UALStarteosError'

declare let window: any

export class Starteos extends Authenticator {
    private users: StarteosUser[] = []
    private scatter: any

    private readonly appName: string
    private readonly magicLink?: string;

    private scatterIsLoading: boolean = false
    private initError: UALError | null = null

    /**
     * Scatter Constructor.
     *
     * @param chains
     * @param options { appName } appName is a required option to use Scatter
     */
    constructor(chains: Chain[], options?: any) {
        super(chains);

        if (options && options.appName) {
            this.appName = options.appName;
            this.magicLink = options.magicLink;
        } else {
            throw new UALStarteosError(
                'Scatter requires the appName property to be set on the `options` argument.',
                UALErrorType.Initialization, null
            )
        }
    }

    /**
     * Checks Scatter for a live connection.  Will set an Initialization Error
     * if we cannot connect to scatter.
     */
    public async init(): Promise<void> {
        this.scatterIsLoading = true
        ScatterJS.plugins(new ScatterEOS())

        // set an errored state if scatter doesn't connect
        if (!await ScatterJS.scatter.connect(this.appName)) {
            this.initError = new UALStarteosError(
                'Error occurred while connecting',
                UALErrorType.Initialization, null
            )

            this.scatterIsLoading = false

            return
        }

        this.scatter = ScatterJS.scatter
        window.ScatterJS = null

        this.scatterIsLoading = false
    }

    public reset(): void {
        this.initError = null
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.init()
    }

    public isLoading(): boolean {
        return this.scatterIsLoading
    }

    public isErrored(): boolean {
        return !!this.initError
    }

    public getError(): UALError | null {
        return this.initError
    }

    public getStyle(): ButtonStyle {
        return {
            icon: StarteosIcon,
            text: 'Starteos',
            textColor: 'white',
            background: '#00cbbe'
        }
    }

    public shouldRender(): boolean {
        return Starteos.isDappBrowser() || !!this.magicLink;
    }

    public shouldAutoLogin(): boolean {
        return false
    }

    public async login(_?: string): Promise<User[]> {
        this.users = [];

        if (!Starteos.isDappBrowser()) {
            if (this.magicLink) {
                window.location.href = this.magicLink;
            }

            throw new UALStarteosError(
                'You need to open the dapp within the Starteos wallet',
                UALErrorType.Login, null
            )
        }

        try {
            for (const chain of this.chains) {
                const user = new StarteosUser(chain, this.scatter)
                await user.getKeys()
                this.users.push(user)
            }

            return this.users
        } catch (e) {
            throw new UALStarteosError('Unable to login', UALErrorType.Login, e)
        }
    }

    /**
     * Call logout on scatter.  Throws a Logout Error if unsuccessful
     */
    public async logout(): Promise<void> {
        try {
            this.scatter.logout()
        } catch (error) {
            throw new UALStarteosError('Error occurred during logout', UALErrorType.Logout, error)
        }
    }

    /**
     * Scatter provides account names so it does not need to request it
     */
    public async shouldRequestAccountName(): Promise<boolean> {
        return false
    }

    public getOnboardingLink(): string {
        return 'https://starteos.io/'
    }

    public requiresGetKeyConfirmation(): boolean {
        return false
    }

    public getName(): string {
        return 'starteos';
    }

    private static isDappBrowser(): boolean {
        const userAgent = window.navigator.userAgent

        return userAgent.toLowerCase().includes('starteos');
    }
}
