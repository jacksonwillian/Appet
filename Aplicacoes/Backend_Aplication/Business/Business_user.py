# used to resolve the path problem
import sys
from os.path import dirname, abspath
diretorio = dirname(dirname(abspath(__file__)))
sys.path.append(diretorio)
# ---------------------------------
import Model.Usuario as User

#POST METHOD ZONE

# user_data = (DIC) novo usuario para ser inserido na base
def createUser(user_data):
    new_user = User.Usuario(nome=user_data['name'], email=user_data['email'],
                            senha=user_data['password'], sobre=user_data['about'])
    try:
        new_user.save()
    except Exception as err:
        print(err)
        return False
    return True


# user_data = (DIC) novas informacoes sobre o usuario
# user_id = (STR) id do usuario a ser atualizado
def updateUser(user_data, user_id):
    old_user = User.Usuario.get((User.Usuario.usuario_id == user_id))
    try:
        old_user.nome = user_data['name']
        old_user.email = user_data['email']
        old_user.senha = user_data['password']
        old_user.sobre = user_data['about']
        old_user.save()
    except Exception as err:
        print(err)
        return False
    return True

#END ZONE

#GET METHOD ZONE

#user_query = (DIC) paramerto de busca.
def findUsers(user_query):
    query_result = None
    final_result = []
    if(user_query['user_id']!= None):
        query_result = User.Usuario.get_by_id(user_query['user_id'])
        final_result.append(_makeResultDic(query_result))
        return final_result

    if(user_query['user_name'] != None):
        if(user_query['email_user'] != None and user_query['about_user'] != None):
            query_result = User.Usuario.select().where((User.Usuario.nome.contains(user_query['user_name'])) &
                                                       (User.Usuario.email == user_query['email_user']) & 
                                                       (User.Usuario.sobre.contains(user_query['about_user'])) )
        else:
            
            if (user_query['email_user'] != None):
                query_result = User.Usuario.select().where((User.Usuario.nome.contains(user_query['user_name'])) &
                                                           (User.Usuario.email == user_query['email_user']))
            elif( user_query['about_user'] != None ):
                query_result = User.Usuario.select().where((User.Usuario.nome.contains(user_query['user_name'])) &
                                                           (User.Usuario.sobre.contains(user_query['about_user'])) )
            else:
                query_result = User.Usuario.select().where((User.Usuario.email == user_query['email_user']) )
            
    elif (user_query['email_user'] != None):
        if (user_query['about_user'] != None):
            query_result = User.Usuario.select().where((User.Usuario.email == user_query['email_user']) &
                                                       (User.Usuario.sobre.contains(user_query['about_user'])) )
        else:
            query_result =User.Usuario.select().where(
                (User.Usuario.email == user_query['email_user']))
    else:
        query_result = User.Usuario.select().where(
            (User.Usuario.sobre.contains(user_query['about_user'])) )
    
    for find_user in query_result:
        final_result.append(_makeResultDic(find_user))
    return final_result

def _makeResultDic(user_obj):
    user_dic = {
        'user_id':user_obj.usuario_id,
        'name':user_obj.nome,
        'email':user_obj.email,
        'password':user_obj.senha,
        'about':user_obj.sobre
    }
    return user_dic
#END ZONE
