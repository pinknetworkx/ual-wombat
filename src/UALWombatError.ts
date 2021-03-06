import {UALError, UALErrorType} from 'universal-authenticator-library'

export class UALWombatError extends UALError {
    constructor(message: string, type: UALErrorType, cause: Error | null) {
        super(message, type, cause, 'wombat')
    }
}
