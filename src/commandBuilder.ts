import type * as Haiku from './typings/index';

export class commandBuilder<builderType extends Haiku.builderTypes, checkUserType extends Haiku.UserTypes>
implements Haiku.CommandBuilder<builderType, checkUserType> {

    data: Haiku.CommandData<builderType, checkUserType>;

    constructor(
        args: Haiku.CommandBuilderOptions<builderType, checkUserType> = {
            name: '',
            description: '',
            checks: [],
            allowedLocations: ['Guild', 'DM']
        }
    ) {

        this.data = {
            name: args.name ?? '',
            description: args.description ?? '',
            checks: args.checks ?? [],
            execute: args.execute ?? (async () => {}),
            autocomplete: args.autocomplete ?? undefined
        }
        if(args.command) {
            this.data.command = args.command;
        }
    }

    static guildOnlyCommand<builderType extends Haiku.builderTypes>(
        args: Haiku.CommandBuilderOptionsSubset<builderType, Haiku.GuildMember>
    ): commandBuilder<builderType, Haiku.GuildMember> {
        return new commandBuilder<builderType, Haiku.GuildMember>(
            Object.assign(args, {allowedLocations: ['Guild']}) as Haiku.CommandBuilderOptions<builderType, Haiku.GuildMember>
        );
    }

    static dmOnlyCommand<builderType extends Haiku.builderTypes>(
        args: Haiku.CommandBuilderOptionsSubset<builderType, Haiku.User>
    ): commandBuilder<builderType, Haiku.User> {
        return new commandBuilder<builderType, Haiku.User>(
            Object.assign(args, {allowedLocations: ['dm']}) as Haiku.CommandBuilderOptions<builderType, Haiku.User>
        );
    }

    addChecks(checks: Haiku.checkType<checkUserType> | Haiku.checkType<checkUserType>[]): this {
        if(checks instanceof Array) {
            this.data.checks!.push(...checks);
        } else {
            this.data.checks!.push(checks);
        }
        return this;
    }

    setChecks(checks: Haiku.checkType<checkUserType> | Haiku.checkType<checkUserType>[]): this {
        if(checks instanceof Array) {
            this.data.checks = checks;
        } else {
            this.data.checks = [checks];
        }
        return this;
    }

    setAutocomplete(autocomplete: Haiku.CommandData<builderType, checkUserType>['autocomplete']): this {
        this.data.autocomplete = autocomplete;
        return this;
    }

    setCallback(callback: Haiku.CommandData<builderType, checkUserType>['execute']): this {
        this.data.execute = callback;
        return this;
    }

    setCommand(command: builderType): this {
        this.data.command = command;
        return this;
    }

    async check(interaction: Haiku.CommandInteraction): Promise<boolean> {
        if(!this.data.checks) return true;
        for(const check of this.data.checks) {
            let result = await check(interaction.member as checkUserType);
            if(!result) return false;
        }
        return true;
    }

    async execute(interaction: Haiku.CommandInteraction): Promise<unknown> {
        if(!this.data.execute) return;
        let result = await this.check(interaction);
        if(!result) return;
        return await this.data.execute(interaction);
    }



}