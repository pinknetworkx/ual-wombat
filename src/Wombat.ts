import ScatterJS from '@scatterjs/core'
import ScatterEOS from '@scatterjs/eosjs2'
import {
    Authenticator, ButtonStyle, Chain,
    UALError, UALErrorType, User
} from 'universal-authenticator-library'
import {WombatIcon} from './WombatIcon'
import {WombatUser} from './WombatUser'
import {UALWombatError} from './UALWombatError'

declare let window: any

export class Wombat extends Authenticator {
    private users: WombatUser[] = []
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
            throw new UALWombatError(
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
        //Detect is the extension
        if ((!window.__wombat__  && !window.scatter) || !await ScatterJS.scatter.connect(this.appName)) {
            this.initError = new UALWombatError(
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
            icon: WombatIcon,
            text: 'Wombat',
            textColor: '#FFFFFF',
            background: '#f43e27'
        }
    }

    public shouldRender(): boolean {
        return Wombat.isDappBrowser() || !!this.magicLink || window.innerWidth > 700;
    }

    public shouldAutoLogin(): boolean {
        return false
    }

    public async login(): Promise<User[]> {
        this.users = [];

        try {
            for (const chain of this.chains) {
                const user = new WombatUser(chain, this.scatter)
                await user.getKeys()
                this.users.push(user)
            }

            return this.users
        } catch (e) {
            throw new UALWombatError('Unable to login', UALErrorType.Login, e)
        }
    }

    /**
     * Call logout on scatter.  Throws a Logout Error if unsuccessful
     */
    public async logout(): Promise<void> {
        try {
            this.scatter.logout()
        } catch (error) {
            throw new UALWombatError('Error occurred during logout', UALErrorType.Logout, error)
        }
    }

    /**
     * Scatter provides account names so it does not need to request it
     */
    public async shouldRequestAccountName(): Promise<boolean> {
        return false;
    }

    public getOnboardingLink(): string {
        return 'https://getwombat.io/'
    }

    public requiresGetKeyConfirmation(): boolean {
        return false;
    }

    public getName(): string {
        return 'wombat';
    }

    private static isDappBrowser(): boolean {
        const userAgent = window.navigator.userAgent

        return userAgent.toLowerCase().includes('wombat');
    }
}
